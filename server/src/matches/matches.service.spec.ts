import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { BadRequestException, NotFoundException, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In } from 'typeorm';
import { MatchesService } from './matches.service';
import { Cause } from '../causes/entities/cause.entity';
import { Volunteer } from '../volunteers/entities/volunteer.entity';
import { Submission } from '../participations/entities/submission.entity';
import { SubmissionService } from '../participations/submission/submission.service';
import { SubmissionStatus } from '../participations/submission/submission-status.enum';
import { Organizer } from '../organizations/entities/organizer.entity';
import { Category } from '../volunteers/entities/category.entity';
import { User } from '../users/entities/user.entity';
import {
    CauseNotAvailableException,
    CauseNotFoundException,
    CauseQuotaFullException,
    DuplicateSubmissionException,
} from '../common/exceptions';
import { GetDeckQueryDto } from './dto/get-deck-query.dto';
import { CreateMatchDto } from './dto/create-match.dto';
import { DismissMatchDto } from './dto/dismiss-match.dto';

describe('MatchesService', () => {
    let service: MatchesService;
    let causeRepository: {
        createQueryBuilder: jest.Mock<(alias?: string) => typeof mockQueryBuilder>;
        findOneBy: jest.Mock<(where: { id: number }) => Promise<Cause | null>>;
        save: jest.Mock<(entity: Cause) => Promise<Cause>>;
    };
    let volunteerRepository: {
        findOne: jest.Mock<(options: { where: { user_id: number } }) => Promise<Volunteer | null>>;
    };
    let submissionRepository: {
        find: jest.Mock<(...args: unknown[]) => Promise<Array<Partial<Submission>>>>;
        count: jest.Mock<(...args: unknown[]) => Promise<number>>;
        createQueryBuilder: jest.Mock<(alias?: string) => typeof mockSubmissionQueryBuilder>;
        save: jest.Mock<(...args: unknown[]) => Promise<Submission>>;
        create: jest.Mock<(...args: unknown[]) => Submission>;
    };
    let submissionService: {
        create: jest.Mock<(userId: number, dto: { cause_id: number; justification: string }) => Promise<Submission>>;
    };
    let mockQueryBuilder: {
        leftJoinAndSelect: jest.Mock<(...args: unknown[]) => typeof mockQueryBuilder>;
        where: jest.Mock<(...args: unknown[]) => typeof mockQueryBuilder>;
        andWhere: jest.Mock<(...args: unknown[]) => typeof mockQueryBuilder>;
        orderBy: jest.Mock<(...args: unknown[]) => typeof mockQueryBuilder>;
        addOrderBy: jest.Mock<(...args: unknown[]) => typeof mockQueryBuilder>;
        getMany: jest.Mock<() => Promise<Cause[]>>;
    };
    let mockSubmissionQueryBuilder: {
        select: jest.Mock<(...args: unknown[]) => typeof mockSubmissionQueryBuilder>;
        addSelect: jest.Mock<(...args: unknown[]) => typeof mockSubmissionQueryBuilder>;
        where: jest.Mock<(...args: unknown[]) => typeof mockSubmissionQueryBuilder>;
        andWhere: jest.Mock<(...args: unknown[]) => typeof mockSubmissionQueryBuilder>;
        groupBy: jest.Mock<(...args: unknown[]) => typeof mockSubmissionQueryBuilder>;
        getRawMany: jest.Mock<() => Promise<Array<{ cause_id: number; count: string | number }>>>;
    };
    let validationPipe: ValidationPipe;

    const mockUser = {
        id: 5,
        role: 'volunteer',
        permissions: ['participate_causes'],
    };

    const mockVolunteer: Volunteer = {
        id: 10,
        user_id: 5,
        description: 'Apasionada por causas ambientales',
        shirt_size: 'M',
        height: '1.65',
        health_center: 'Sura',
        blood_type: 'O+',
        emergency_contact: '+57 300 000 0000',
        completed_causes: 3,
        user: {} as User,
        volunteerSkills: [],
        volunteerCategories: [],
        volunteerAchievements: [],
        submissions: [],
        attendances: [],
    };

    const mockOrganizer: Partial<Organizer> = {
        id: 1,
        name: 'Fundación Huellas Verdes',
        verification_status: 'verified',
    };

    const mockCategory: Partial<Category> = {
        id: 2,
        name: 'Medio Ambiente',
    };

    const mockCause1: Cause = {
        id: 101,
        organizer_id: 1,
        category_id: 2,
        title: 'Gran Sembratón Comunitaria',
        cover_image_url: 'https://images.kindly.org/causes/sembraton.jpg',
        description: 'Jornada de siembra comunitaria en reserva natural',
        capacity: 20,
        created_at: new Date('2026-01-01'),
        start_date: new Date('2026-11-01'),
        end_date: new Date('2026-11-02'),
        address: 'Parque Ecológico Arví, Medellín',
        is_available: true,
        location_latitude: '6.2442',
        location_longitude: '-75.5812',
        progress: 'open',
        qr_code: 'QR-CAUSE-101',
        organizer: mockOrganizer as Organizer,
        category: mockCategory as Category,
        supplies: [],
        announcements: [],
        images: [],
        submissions: [],
        attendances: [],
    };

    const mockCause2: Cause = {
        id: 102,
        organizer_id: 1,
        category_id: 2,
        title: 'Jornada de Limpieza de Río',
        cover_image_url: 'https://images.kindly.org/causes/rio.jpg',
        description: 'Recolección de residuos en la ribera del río',
        capacity: 15,
        created_at: new Date('2026-01-02'),
        start_date: new Date('2026-11-05'),
        end_date: new Date('2026-11-06'),
        address: 'Ribera Río Medellín',
        is_available: true,
        location_latitude: '6.2500',
        location_longitude: '-75.5700',
        progress: 'open',
        qr_code: 'QR-CAUSE-102',
        organizer: mockOrganizer as Organizer,
        category: mockCategory as Category,
        supplies: [],
        announcements: [],
        images: [],
        submissions: [],
        attendances: [],
    };

    const mockCauseFull: Cause = {
        id: 103,
        organizer_id: 1,
        category_id: 2,
        title: 'Taller de Huertos Urbanos',
        cover_image_url: 'https://images.kindly.org/causes/huertos.jpg',
        description: 'Taller práctico de cultivo urbano',
        capacity: 5,
        created_at: new Date('2026-01-03'),
        start_date: new Date('2026-11-10'),
        end_date: new Date('2026-11-11'),
        address: 'Centro Comunitario',
        is_available: true,
        location_latitude: '6.2600',
        location_longitude: '-75.5600',
        progress: 'open',
        qr_code: 'QR-CAUSE-103',
        organizer: mockOrganizer as Organizer,
        category: mockCategory as Category,
        supplies: [],
        announcements: [],
        images: [],
        submissions: [],
        attendances: [],
    };

    const mockCreatedSubmission: Submission = {
        id: 42,
        volunteer_id: 10,
        cause_id: 101,
        status: SubmissionStatus.PENDING,
        created_at: new Date('2026-10-09T10:00:00Z'),
        justification: 'Me apasiona la reforestación y quiero aportar mi tiempo.',
        volunteer: mockVolunteer,
        cause: mockCause1,
    };

    beforeEach(async () => {
        mockQueryBuilder = {
            leftJoinAndSelect: jest.fn((..._args: unknown[]) => mockQueryBuilder),
            where: jest.fn((..._args: unknown[]) => mockQueryBuilder),
            andWhere: jest.fn((..._args: unknown[]) => mockQueryBuilder),
            orderBy: jest.fn((..._args: unknown[]) => mockQueryBuilder),
            addOrderBy: jest.fn((..._args: unknown[]) => mockQueryBuilder),
            getMany: jest.fn(() => Promise.resolve([mockCause1, mockCause2])),
        };

        mockSubmissionQueryBuilder = {
            select: jest.fn((..._args: unknown[]) => mockSubmissionQueryBuilder),
            addSelect: jest.fn((..._args: unknown[]) => mockSubmissionQueryBuilder),
            where: jest.fn((..._args: unknown[]) => mockSubmissionQueryBuilder),
            andWhere: jest.fn((..._args: unknown[]) => mockSubmissionQueryBuilder),
            groupBy: jest.fn((..._args: unknown[]) => mockSubmissionQueryBuilder),
            getRawMany: jest.fn(() => Promise.resolve([] as Array<{ cause_id: number; count: string | number }>)),
        };

        causeRepository = {
            createQueryBuilder: jest.fn((_alias?: string) => mockQueryBuilder),
            findOneBy: jest.fn((_where: { id: number }) => Promise.resolve(mockCause1 as Cause | null)),
            save: jest.fn((entity: Cause) => Promise.resolve(entity)),
        };

        volunteerRepository = {
            findOne: jest.fn((_options: { where: { user_id: number } }) =>
                Promise.resolve(mockVolunteer as Volunteer | null),
            ),
        };

        submissionRepository = {
            find: jest.fn((..._args: unknown[]) => Promise.resolve([] as Array<Partial<Submission>>)),
            count: jest.fn((..._args: unknown[]) => Promise.resolve(0)),
            createQueryBuilder: jest.fn((_alias?: string) => mockSubmissionQueryBuilder),
            save: jest.fn((..._args: unknown[]) => Promise.resolve(mockCreatedSubmission)),
            create: jest.fn((..._args: unknown[]) => mockCreatedSubmission),
        };

        submissionService = {
            create: jest.fn((_userId: number, _dto: { cause_id: number; justification: string }) =>
                Promise.resolve(mockCreatedSubmission),
            ),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MatchesService,
                {
                    provide: getRepositoryToken(Cause),
                    useValue: causeRepository,
                },
                {
                    provide: getRepositoryToken(Volunteer),
                    useValue: volunteerRepository,
                },
                {
                    provide: getRepositoryToken(Submission),
                    useValue: submissionRepository,
                },
                {
                    provide: SubmissionService,
                    useValue: submissionService,
                },
            ],
        }).compile();

        service = module.get<MatchesService>(MatchesService);

        validationPipe = new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        });
    });

    describe('US-3.1.1: Browse causes with swipe cards', () => {
        it('1. should return swipe cards deck with available causes for an authenticated volunteer', async () => {
            const cards = await service.getDeck(mockUser);

            expect(volunteerRepository.findOne).toHaveBeenCalledWith({
                where: { user_id: mockUser.id },
            });
            expect(submissionRepository.find).toHaveBeenCalledWith({
                where: {
                    volunteer_id: mockVolunteer.id,
                    status: In([SubmissionStatus.PENDING, SubmissionStatus.ACCEPTED]),
                },
                select: ['cause_id'],
            });
            expect(causeRepository.createQueryBuilder).toHaveBeenCalledWith('cause');
            expect(mockQueryBuilder.where).toHaveBeenCalledWith('cause.is_available = :isAvailable', {
                isAvailable: true,
            });
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('cause.progress = :progress', {
                progress: 'open',
            });
            expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('cause.start_date', 'ASC');
            expect(mockQueryBuilder.addOrderBy).toHaveBeenCalledWith('cause.id', 'ASC');
            expect(cards).toHaveLength(2);
            expect(cards[0].id).toBe(101);
            expect(cards[1].id).toBe(102);
        });

        it('2. should exclude causes where the volunteer already has a pending or accepted submission', async () => {
            submissionRepository.find.mockResolvedValue([{ cause_id: 101 }]);

            await service.getDeck(mockUser);

            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('cause.id NOT IN (:...excludedCauseIds)', {
                excludedCauseIds: [101],
            });
        });

        it('should allow causes with only rejected submissions to be included in deck query filter', async () => {
            submissionRepository.find.mockResolvedValue([]);

            const cards = await service.getDeck(mockUser);

            expect(submissionRepository.find).toHaveBeenCalledWith({
                where: {
                    volunteer_id: mockVolunteer.id,
                    status: In([SubmissionStatus.PENDING, SubmissionStatus.ACCEPTED]),
                },
                select: ['cause_id'],
            });
            expect(cards).toHaveLength(2);
        });

        it('3. should exclude causes that have reached maximum capacity', async () => {
            mockQueryBuilder.getMany.mockResolvedValue([mockCause1, mockCauseFull]);
            mockSubmissionQueryBuilder.getRawMany.mockResolvedValue([
                { cause_id: 101, count: 2 },
                { cause_id: 103, count: 5 },
            ]);

            const cards = await service.getDeck(mockUser);

            expect(cards).toHaveLength(1);
            expect(cards[0].id).toBe(101);
        });

        it('4. should handle causes without capacity limit as unlimited spots', async () => {
            const mockCauseNoLimit: Cause = {
                ...mockCause1,
                capacity: null as unknown as number,
            };
            mockQueryBuilder.getMany.mockResolvedValue([mockCauseNoLimit]);
            mockSubmissionQueryBuilder.getRawMany.mockResolvedValue([{ cause_id: 101, count: 4 }]);

            const cards = await service.getDeck(mockUser);

            expect(cards).toHaveLength(1);
            expect(cards[0].capacity).toBeNull();
            expect(cards[0].spots_available).toBeNull();
            expect(cards[0].occupied_spots).toBe(4);
            expect(cards[0].is_full).toBe(false);
        });

        it('should perform a single batch aggregation query for occupied spots instead of N count queries', async () => {
            mockQueryBuilder.getMany.mockResolvedValue([mockCause1, mockCause2]);
            mockSubmissionQueryBuilder.getRawMany.mockResolvedValue([
                { cause_id: 101, count: 3 },
                { cause_id: 102, count: 7 },
            ]);

            const cards = await service.getDeck(mockUser);

            expect(submissionRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
            expect(submissionRepository.createQueryBuilder).toHaveBeenCalledWith('submission');
            expect(mockSubmissionQueryBuilder.where).toHaveBeenCalledWith(
                'submission.cause_id IN (:...candidateCauseIds)',
                { candidateCauseIds: [101, 102] },
            );
            expect(mockSubmissionQueryBuilder.groupBy).toHaveBeenCalledWith('submission.cause_id');
            expect(submissionRepository.count).not.toHaveBeenCalled();
            expect(cards).toHaveLength(2);
            expect(cards[0].occupied_spots).toBe(3);
            expect(cards[1].occupied_spots).toBe(7);
        });

        it('5. should throw NotFoundException when the user does not have a volunteer profile', async () => {
            volunteerRepository.findOne.mockResolvedValue(null);

            await expect(service.getDeck(mockUser)).rejects.toThrow(NotFoundException);
        });

        it('6. should return an empty array when no eligible causes match the deck filters', async () => {
            mockQueryBuilder.getMany.mockResolvedValue([]);

            const cards = await service.getDeck(mockUser);

            expect(cards).toEqual([]);
        });

        it('7. should apply pagination limit and page parameters correctly', async () => {
            mockQueryBuilder.getMany.mockResolvedValue([mockCause1, mockCause2]);

            const page1Cards = await service.getDeck(mockUser, { limit: 1, page: 1 });
            expect(page1Cards).toHaveLength(1);
            expect(page1Cards[0].id).toBe(101);

            const page2Cards = await service.getDeck(mockUser, { limit: 1, page: 2 });
            expect(page2Cards).toHaveLength(1);
            expect(page2Cards[0].id).toBe(102);
        });

        it('8. should reject invalid limit query values via ValidationPipe', async () => {
            await expect(
                validationPipe.transform({ limit: 0 }, { type: 'query', metatype: GetDeckQueryDto }),
            ).rejects.toThrow(BadRequestException);

            await expect(
                validationPipe.transform({ limit: 51 }, { type: 'query', metatype: GetDeckQueryDto }),
            ).rejects.toThrow(BadRequestException);
        });

        it('9. should reject forbidden query properties via ValidationPipe', async () => {
            await expect(
                validationPipe.transform(
                    { limit: 10, volunteer_id: 10, role: 'admin' },
                    { type: 'query', metatype: GetDeckQueryDto },
                ),
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('US-3.1.2: View cause information on cards', () => {
        it('10. should correctly construct card information structure with all required fields', async () => {
            mockSubmissionQueryBuilder.getRawMany.mockResolvedValue([{ cause_id: 101, count: 3 }]);

            const cards = await service.getDeck(mockUser, { limit: 1, page: 1 });
            const card = cards[0];

            expect(card.id).toBe(101);
            expect(card.title).toBe('Gran Sembratón Comunitaria');
            expect(card.description).toBe('Jornada de siembra comunitaria en reserva natural');
            expect(card.cover_image_url).toBe('https://images.kindly.org/causes/sembraton.jpg');
            expect(card.organization).toEqual({
                id: 1,
                name: 'Fundación Huellas Verdes',
                verification_status: 'verified',
                is_verified: true,
            });
            expect(card.category).toEqual({
                id: 2,
                name: 'Medio Ambiente',
            });
            expect(card.start_date).toEqual(new Date('2026-11-01'));
            expect(card.end_date).toEqual(new Date('2026-11-02'));
            expect(card.location).toEqual({
                address: 'Parque Ecológico Arví, Medellín',
                latitude: '6.2442',
                longitude: '-75.5812',
            });
            expect(card.capacity).toBe(20);
            expect(card.spots_available).toBe(17);
            expect(card.occupied_spots).toBe(3);
            expect(card.is_full).toBe(false);
        });

        it('11. should mark unverified organizations correctly in card response', async () => {
            const unverifiedCause: Cause = {
                ...mockCause1,
                organizer: {
                    id: 3,
                    name: 'Asociación Nueva',
                    verification_status: 'pending',
                } as Organizer,
            };
            mockQueryBuilder.getMany.mockResolvedValue([unverifiedCause]);

            const cards = await service.getDeck(mockUser);

            expect(cards[0].organization.is_verified).toBe(false);
            expect(cards[0].organization.verification_status).toBe('pending');
        });
    });

    describe('US-3.1.3: Match with a cause', () => {
        it('12. should successfully match with a cause when explicit justification is provided', async () => {
            const result = await service.match(5, {
                cause_id: 101,
                justification: 'Me apasiona la reforestación y quiero aportar mi tiempo.',
            });

            expect(submissionService.create).toHaveBeenCalledWith(5, {
                cause_id: 101,
                justification: 'Me apasiona la reforestación y quiero aportar mi tiempo.',
            });
            expect(result).toEqual(mockCreatedSubmission);
        });

        it('13. should use default justification in English when justification is omitted or empty', async () => {
            await service.match(5, { cause_id: 101 });

            expect(submissionService.create).toHaveBeenCalledWith(5, {
                cause_id: 101,
                justification: 'Automatically generated application through Kindly Match.',
            });

            await service.match(5, { cause_id: 101, justification: '   ' });

            expect(submissionService.create).toHaveBeenCalledWith(5, {
                cause_id: 101,
                justification: 'Automatically generated application through Kindly Match.',
            });
        });

        it('14. should correctly delegate to SubmissionService with authenticated userId and causeId', async () => {
            await service.match(99, { cause_id: 202 });

            expect(submissionService.create).toHaveBeenCalledTimes(1);
            expect(submissionService.create).toHaveBeenCalledWith(99, {
                cause_id: 202,
                justification: 'Automatically generated application through Kindly Match.',
            });
        });

        it('15. should propagate CauseNotFoundException when the cause does not exist', async () => {
            submissionService.create.mockRejectedValue(new CauseNotFoundException(999));

            await expect(service.match(5, { cause_id: 999 })).rejects.toThrow(CauseNotFoundException);
        });

        it('16. should propagate CauseNotAvailableException when cause is not available or has ended', async () => {
            submissionService.create.mockRejectedValue(new CauseNotAvailableException());

            await expect(service.match(5, { cause_id: 101 })).rejects.toThrow(CauseNotAvailableException);
        });

        it('17. should propagate DuplicateSubmissionException when volunteer already applied to the cause', async () => {
            submissionService.create.mockRejectedValue(new DuplicateSubmissionException());

            await expect(service.match(5, { cause_id: 101 })).rejects.toThrow(DuplicateSubmissionException);
        });

        it('18. should propagate CauseQuotaFullException when cause capacity is full', async () => {
            submissionService.create.mockRejectedValue(new CauseQuotaFullException());

            await expect(service.match(5, { cause_id: 101 })).rejects.toThrow(CauseQuotaFullException);
        });

        it('19. should propagate NotFoundException when volunteer profile is not found', async () => {
            submissionService.create.mockRejectedValue(
                new NotFoundException("Volunteer profile for user '5' not found."),
            );

            await expect(service.match(5, { cause_id: 101 })).rejects.toThrow(NotFoundException);
        });

        it('20. should reject invalid cause_id values in CreateMatchDto via ValidationPipe', async () => {
            await expect(
                validationPipe.transform({ cause_id: 0 }, { type: 'body', metatype: CreateMatchDto }),
            ).rejects.toThrow(BadRequestException);

            await expect(
                validationPipe.transform({ cause_id: -5 }, { type: 'body', metatype: CreateMatchDto }),
            ).rejects.toThrow(BadRequestException);

            await expect(
                validationPipe.transform({ cause_id: 1.5 }, { type: 'body', metatype: CreateMatchDto }),
            ).rejects.toThrow(BadRequestException);

            await expect(validationPipe.transform({}, { type: 'body', metatype: CreateMatchDto })).rejects.toThrow(
                BadRequestException,
            );
        });

        it('21. should reject justification exceeding 1000 characters in CreateMatchDto via ValidationPipe', async () => {
            const longJustification = 'a'.repeat(1001);

            await expect(
                validationPipe.transform(
                    { cause_id: 101, justification: longJustification },
                    { type: 'body', metatype: CreateMatchDto },
                ),
            ).rejects.toThrow(BadRequestException);
        });

        it('22. should reject unwhitelisted properties like volunteer_id via ValidationPipe', async () => {
            await expect(
                validationPipe.transform(
                    { cause_id: 101, volunteer_id: 99, status: 'accepted' },
                    { type: 'body', metatype: CreateMatchDto },
                ),
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('US-3.1.4: Dismiss a cause', () => {
        it('23. should successfully dismiss an existing cause without persisting anything', async () => {
            const result = await service.dismiss(5, { cause_id: 101 });

            expect(causeRepository.findOneBy).toHaveBeenCalledWith({ id: 101 });
            expect(result).toEqual({
                dismissed: true,
                cause_id: 101,
            });
            expect(submissionRepository.create).not.toHaveBeenCalled();
            expect(submissionRepository.save).not.toHaveBeenCalled();
            expect(submissionService.create).not.toHaveBeenCalled();
            expect(causeRepository.save).not.toHaveBeenCalled();
        });

        it('24. should propagate CauseNotFoundException when the dismissed cause does not exist', async () => {
            causeRepository.findOneBy.mockResolvedValue(null);

            await expect(service.dismiss(5, { cause_id: 999 })).rejects.toThrow(CauseNotFoundException);
            expect(submissionRepository.create).not.toHaveBeenCalled();
            expect(submissionRepository.save).not.toHaveBeenCalled();
            expect(submissionService.create).not.toHaveBeenCalled();
        });

        it('25. should reject invalid cause_id values in DismissMatchDto via ValidationPipe', async () => {
            await expect(
                validationPipe.transform({ cause_id: 0 }, { type: 'body', metatype: DismissMatchDto }),
            ).rejects.toThrow(BadRequestException);

            await expect(
                validationPipe.transform({ cause_id: -1 }, { type: 'body', metatype: DismissMatchDto }),
            ).rejects.toThrow(BadRequestException);

            await expect(
                validationPipe.transform({ cause_id: 2.7 }, { type: 'body', metatype: DismissMatchDto }),
            ).rejects.toThrow(BadRequestException);

            await expect(validationPipe.transform({}, { type: 'body', metatype: DismissMatchDto })).rejects.toThrow(
                BadRequestException,
            );
        });

        it('26. should reject unwhitelisted properties like volunteer_id in DismissMatchDto via ValidationPipe', async () => {
            await expect(
                validationPipe.transform(
                    { cause_id: 101, volunteer_id: 5, extra: 'forbidden' },
                    { type: 'body', metatype: DismissMatchDto },
                ),
            ).rejects.toThrow(BadRequestException);
        });

        it('27. should confirm dismiss does not alter any existing submission or cause state', async () => {
            await service.dismiss(5, { cause_id: 101 });

            expect(submissionRepository.save).not.toHaveBeenCalled();
            expect(submissionService.create).not.toHaveBeenCalled();
            expect(causeRepository.save).not.toHaveBeenCalled();
        });
    });
});
