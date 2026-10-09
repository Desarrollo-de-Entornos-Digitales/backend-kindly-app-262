import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import {
    CauseNotAvailableException,
    CauseQuotaFullException,
    DuplicateSubmissionException,
    InvalidSubmissionStatusException,
    SubmissionNotFoundException,
} from '../../common/exceptions';
import { Cause } from '../../causes/entities/cause.entity';
import { Volunteer } from '../../volunteers/entities/volunteer.entity';
import { Submission } from '../entities/submission.entity';
import { SubmissionService } from './submission.service';
import { SubmissionStatus } from './submission-status.enum';

const futureDate = () => new Date(Date.now() + 24 * 60 * 60 * 1000);

describe('SubmissionService', () => {
    let service: SubmissionService;
    const submissionRepository = {
        existsBy: jest.fn<() => Promise<boolean>>(),
        create: jest.fn((data: Partial<Submission>) => data as Submission),
        save: jest.fn((data: Submission) => Promise.resolve(Object.assign(data, { id: 1 }))),
        find: jest.fn<(options: object) => Promise<Submission[]>>(),
        findOne: jest.fn<() => Promise<Submission | null>>(),
    };
    const causeRepository = {
        findOneBy: jest.fn<() => Promise<Cause | null>>(),
        existsBy: jest.fn<() => Promise<boolean>>(),
    };
    const volunteerRepository = {
        findOneBy: jest.fn<(where: object) => Promise<Volunteer | null>>(),
    };
    const manager = {
        findOneBy: jest.fn<() => Promise<Submission | null>>(),
        findOne: jest.fn<() => Promise<Cause | null>>(),
        countBy: jest.fn<() => Promise<number>>(),
        save: jest.fn((entity: Submission) => Promise.resolve(entity)),
    };
    const dataSource = {
        manager,
        transaction: jest.fn((work: (m: EntityManager) => Promise<unknown>) =>
            work(manager as unknown as EntityManager),
        ),
    };

    const cause = (overrides: Partial<Cause> = {}) =>
        ({ id: 10, is_available: true, end_date: futureDate(), capacity: 2, ...overrides }) as Cause;

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SubmissionService,
                { provide: getRepositoryToken(Submission), useValue: submissionRepository },
                { provide: getRepositoryToken(Cause), useValue: causeRepository },
                { provide: getRepositoryToken(Volunteer), useValue: volunteerRepository },
                { provide: DataSource, useValue: dataSource },
            ],
        }).compile();

        service = module.get(SubmissionService);
    });

    describe('create', () => {
        const userId = 7;
        const dto = { cause_id: 10, justification: 'Quiero ayudar' };

        beforeEach(() => {
            volunteerRepository.findOneBy.mockResolvedValue({ id: 1 } as Volunteer);
            causeRepository.findOneBy.mockResolvedValue(cause());
            submissionRepository.existsBy.mockResolvedValue(false);
            manager.countBy.mockResolvedValue(0);
        });

        it('creates a pending submission with the justification', async () => {
            const result = await service.create(userId, dto);
            expect(result.status).toBe(SubmissionStatus.PENDING);
            expect(result.justification).toBe('Quiero ayudar');
        });

        it('uses the volunteer profile of the authenticated user', async () => {
            const result = await service.create(userId, dto);
            expect(volunteerRepository.findOneBy).toHaveBeenCalledWith({ user_id: userId });
            expect(result.volunteer_id).toBe(1);
        });

        it('fails when the user has no volunteer profile', async () => {
            volunteerRepository.findOneBy.mockResolvedValue(null);
            await expect(service.create(userId, dto)).rejects.toThrow(NotFoundException);
        });

        it('fails when the cause is not available', async () => {
            causeRepository.findOneBy.mockResolvedValue(cause({ is_available: false }));
            await expect(service.create(userId, dto)).rejects.toThrow(CauseNotAvailableException);
        });

        it('fails when the cause has already ended', async () => {
            causeRepository.findOneBy.mockResolvedValue(cause({ end_date: new Date('2020-01-01') }));
            await expect(service.create(userId, dto)).rejects.toThrow(CauseNotAvailableException);
        });

        it('fails when the volunteer already has an active submission', async () => {
            submissionRepository.existsBy.mockResolvedValue(true);
            await expect(service.create(userId, dto)).rejects.toThrow(DuplicateSubmissionException);
        });

        it('fails when the cause is already full', async () => {
            manager.countBy.mockResolvedValue(2);
            await expect(service.create(userId, dto)).rejects.toThrow(CauseQuotaFullException);
        });
    });

    describe('findMine', () => {
        it('returns the submissions of the authenticated volunteer', async () => {
            volunteerRepository.findOneBy.mockResolvedValue({ id: 1 } as Volunteer);
            submissionRepository.find.mockResolvedValue([]);

            await service.findMine(7, { status: SubmissionStatus.PENDING });

            expect(volunteerRepository.findOneBy).toHaveBeenCalledWith({ user_id: 7 });
            expect(submissionRepository.find).toHaveBeenCalledWith(
                expect.objectContaining({ where: { volunteer_id: 1, status: SubmissionStatus.PENDING } }),
            );
        });

        it('fails when the user has no volunteer profile', async () => {
            volunteerRepository.findOneBy.mockResolvedValue(null);
            await expect(service.findMine(7, {})).rejects.toThrow(NotFoundException);
        });
    });

    describe('accept', () => {
        it('accepts a pending submission when there is capacity', async () => {
            manager.findOneBy.mockResolvedValue({
                id: 1,
                cause_id: 10,
                status: SubmissionStatus.PENDING,
            } as Submission);
            manager.findOne.mockResolvedValue(cause());
            manager.countBy.mockResolvedValue(1);

            const result = await service.accept(1);
            expect(result.status).toBe(SubmissionStatus.ACCEPTED);
        });

        it('ignores capacity when the cause has no limit', async () => {
            manager.findOneBy.mockResolvedValue({
                id: 1,
                cause_id: 10,
                status: SubmissionStatus.PENDING,
            } as Submission);
            manager.findOne.mockResolvedValue(cause({ capacity: null as unknown as number }));

            const result = await service.accept(1);
            expect(result.status).toBe(SubmissionStatus.ACCEPTED);
            expect(manager.countBy).not.toHaveBeenCalled();
        });

        it('rejects the acceptance when the cause is full', async () => {
            manager.findOneBy.mockResolvedValue({
                id: 1,
                cause_id: 10,
                status: SubmissionStatus.PENDING,
            } as Submission);
            manager.findOne.mockResolvedValue(cause());
            manager.countBy.mockResolvedValue(2);

            await expect(service.accept(1)).rejects.toThrow(CauseQuotaFullException);
            expect(manager.save).not.toHaveBeenCalled();
        });

        it('fails when the submission is not pending', async () => {
            manager.findOneBy.mockResolvedValue({ id: 1, status: SubmissionStatus.REJECTED } as Submission);
            await expect(service.accept(1)).rejects.toThrow(InvalidSubmissionStatusException);
        });

        it('fails when the submission does not exist', async () => {
            manager.findOneBy.mockResolvedValue(null);
            await expect(service.accept(99)).rejects.toThrow(SubmissionNotFoundException);
        });
    });

    describe('reject', () => {
        it('rejects a pending submission', async () => {
            manager.findOneBy.mockResolvedValue({ id: 1, status: SubmissionStatus.PENDING } as Submission);
            const result = await service.reject(1);
            expect(result.status).toBe(SubmissionStatus.REJECTED);
        });

        it('fails when the submission was already accepted', async () => {
            manager.findOneBy.mockResolvedValue({ id: 1, status: SubmissionStatus.ACCEPTED } as Submission);
            await expect(service.reject(1)).rejects.toThrow(InvalidSubmissionStatusException);
        });
    });

    describe('findOne', () => {
        it('fails when the submission does not exist', async () => {
            submissionRepository.findOne.mockResolvedValue(null);
            await expect(service.findOne(99)).rejects.toThrow(SubmissionNotFoundException);
        });
    });
});
