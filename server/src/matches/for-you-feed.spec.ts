import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In } from 'typeorm';
import { Cause } from '../causes/entities/cause.entity';
import { Volunteer } from '../volunteers/entities/volunteer.entity';
import { Submission } from '../participations/entities/submission.entity';
import { SubmissionService } from '../participations/submission/submission.service';
import { SubmissionStatus } from '../participations/submission/submission-status.enum';
import { MatchesService } from './matches.service';

const ENVIRONMENT = 1;
const ANIMALS = 2;
const EDUCATION = 3;

const causeOf = (id: number, categoryId: number, startInDays: number, capacity: number | null = null) =>
    ({
        id,
        title: `Cause ${id}`,
        category_id: categoryId,
        category: { id: categoryId, name: `Category ${categoryId}` },
        capacity,
        start_date: new Date(Date.now() + startInDays * 24 * 60 * 60 * 1000),
        end_date: new Date(Date.now() + (startInDays + 1) * 24 * 60 * 60 * 1000),
    }) as unknown as Cause;

describe('For You feed', () => {
    let service: MatchesService;
    const causeQueryBuilder = {
        leftJoinAndSelect: jest.fn(() => causeQueryBuilder),
        where: jest.fn((..._args: unknown[]) => causeQueryBuilder),
        andWhere: jest.fn((..._args: unknown[]) => causeQueryBuilder),
        orderBy: jest.fn(() => causeQueryBuilder),
        addOrderBy: jest.fn(() => causeQueryBuilder),
        getMany: jest.fn<() => Promise<Cause[]>>(),
    };
    const countQueryBuilder = {
        select: jest.fn(() => countQueryBuilder),
        addSelect: jest.fn(() => countQueryBuilder),
        where: jest.fn(() => countQueryBuilder),
        andWhere: jest.fn(() => countQueryBuilder),
        groupBy: jest.fn(() => countQueryBuilder),
        getRawMany: jest.fn<() => Promise<{ cause_id: number; count: string }[]>>(),
    };
    const causeRepository = { createQueryBuilder: jest.fn(() => causeQueryBuilder) };
    const volunteerRepository = { findOne: jest.fn<(options: object) => Promise<Volunteer | null>>() };
    const submissionRepository = {
        find: jest.fn<(options: object) => Promise<Submission[]>>(),
        createQueryBuilder: jest.fn(() => countQueryBuilder),
    };

    const volunteerWithInterests = (...categoryIds: number[]) =>
        ({ id: 1, volunteerCategories: categoryIds.map((category_id) => ({ category_id })) }) as unknown as Volunteer;

    const ids = (cards: { id: number }[]) => cards.map((card) => card.id);

    beforeEach(async () => {
        jest.clearAllMocks();
        volunteerRepository.findOne.mockResolvedValue(volunteerWithInterests(ANIMALS));
        submissionRepository.find.mockResolvedValue([]);
        countQueryBuilder.getRawMany.mockResolvedValue([]);
        causeQueryBuilder.getMany.mockResolvedValue([
            causeOf(10, ENVIRONMENT, 1),
            causeOf(11, ANIMALS, 2),
            causeOf(12, EDUCATION, 3),
            causeOf(13, ANIMALS, 4),
        ]);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MatchesService,
                { provide: getRepositoryToken(Cause), useValue: causeRepository },
                { provide: getRepositoryToken(Volunteer), useValue: volunteerRepository },
                { provide: getRepositoryToken(Submission), useValue: submissionRepository },
                { provide: SubmissionService, useValue: {} },
            ],
        }).compile();

        service = module.get(MatchesService);
    });

    it('shows causes matching the volunteer interests first, then the rest by date', async () => {
        const cards = await service.getForYouFeed(7);
        expect(ids(cards)).toEqual([11, 13, 10, 12]);
    });

    it('gives an affinity score of 1 to matching causes and 0 to the rest', async () => {
        const cards = await service.getForYouFeed(7);
        expect(cards.map((card) => [card.id, card.affinity_score])).toEqual([
            [11, 1],
            [13, 1],
            [10, 0],
            [12, 0],
        ]);
    });

    it('ranks every interest category the same', async () => {
        volunteerRepository.findOne.mockResolvedValue(volunteerWithInterests(ANIMALS, EDUCATION));
        const cards = await service.getForYouFeed(7);
        expect(ids(cards)).toEqual([11, 12, 13, 10]);
    });

    it('shows upcoming causes by date when the volunteer has no interests', async () => {
        volunteerRepository.findOne.mockResolvedValue(volunteerWithInterests());
        const cards = await service.getForYouFeed(7);

        expect(ids(cards)).toEqual([10, 11, 12, 13]);
        expect(cards.every((card) => card.affinity_score === 0)).toBe(true);
    });

    it('uses the volunteer from the jwt with their interests', async () => {
        await service.getForYouFeed(7);
        expect(volunteerRepository.findOne).toHaveBeenCalledWith({
            where: { user_id: 7 },
            relations: { volunteerCategories: true },
        });
    });

    it('applies the same availability filters as the deck', async () => {
        await service.getForYouFeed(7);

        expect(causeQueryBuilder.where).toHaveBeenCalledWith('cause.is_available = :isAvailable', {
            isAvailable: true,
        });
        expect(causeQueryBuilder.andWhere).toHaveBeenCalledWith('cause.progress = :progress', { progress: 'open' });
        expect(causeQueryBuilder.andWhere).toHaveBeenCalledWith('cause.end_date >= :now', {
            now: expect.any(Date),
        });
    });

    it('excludes causes with a pending or accepted application', async () => {
        submissionRepository.find.mockResolvedValue([{ cause_id: 11 } as Submission]);

        await service.getForYouFeed(7);

        expect(submissionRepository.find).toHaveBeenCalledWith({
            where: { volunteer_id: 1, status: In([SubmissionStatus.PENDING, SubmissionStatus.ACCEPTED]) },
            select: ['cause_id'],
        });
        expect(causeQueryBuilder.andWhere).toHaveBeenCalledWith('cause.id NOT IN (:...excludedCauseIds)', {
            excludedCauseIds: [11],
        });
    });

    it('hides causes that are already full', async () => {
        causeQueryBuilder.getMany.mockResolvedValue([causeOf(11, ANIMALS, 2, 2), causeOf(13, ANIMALS, 4, 2)]);
        countQueryBuilder.getRawMany.mockResolvedValue([{ cause_id: 11, count: '2' }]);

        const cards = await service.getForYouFeed(7);

        expect(ids(cards)).toEqual([13]);
        expect(cards[0].spots_available).toBe(2);
    });

    it('paginates after ranking', async () => {
        const firstPage = await service.getForYouFeed(7, { page: 1, limit: 2 });
        const secondPage = await service.getForYouFeed(7, { page: 2, limit: 2 });

        expect(ids(firstPage)).toEqual([11, 13]);
        expect(ids(secondPage)).toEqual([10, 12]);
    });

    it('fails when the user has no volunteer profile', async () => {
        volunteerRepository.findOne.mockResolvedValue(null);
        await expect(service.getForYouFeed(7)).rejects.toThrow(NotFoundException);
    });
});
