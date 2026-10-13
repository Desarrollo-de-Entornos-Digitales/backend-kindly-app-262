import { describe, beforeEach, it, expect, jest } from '@jest/globals';

jest.mock('@nestjs/passport', () => ({
    AuthGuard: () =>
        class MockAuthGuard {
            canActivate() {
                return true;
            }
        },
    PassportModule: class MockPassportModule {},
}));
import {
    BadRequestException,
    ExecutionContext,
    ForbiddenException,
    NotFoundException,
    UnauthorizedException,
    ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In } from 'typeorm';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';
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
import { PositiveIntPipe } from '../common/pipes/positive-int.pipe';
import { GetDeckQueryDto } from './dto/get-deck-query.dto';
import { CreateMatchDto } from './dto/create-match.dto';
import { DismissMatchDto } from './dto/dismiss-match.dto';

describe('MatchesService', () => {
    let service: MatchesService;
    let causeRepository: {
        createQueryBuilder: jest.Mock<(alias?: string) => typeof mockQueryBuilder>;
        findOne: jest.Mock<(...args: unknown[]) => Promise<Cause | null>>;
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
    let positiveIntPipe: PositiveIntPipe;

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
            findOne: jest.fn((..._args: unknown[]) => Promise.resolve(mockCause1 as Cause | null)),
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

        positiveIntPipe = new PositiveIntPipe();
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

    describe('US-3.2.1: View causes on an interactive map', () => {
        it('28. should return lightweight geolocated pins for active causes with valid coordinates', async () => {
            const pins = await service.getMapPins();

            expect(causeRepository.createQueryBuilder).toHaveBeenCalledWith('cause');
            expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('cause.category', 'category');
            expect(mockQueryBuilder.where).toHaveBeenCalledWith('cause.is_available = :isAvailable', {
                isAvailable: true,
            });
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('cause.progress = :progress', {
                progress: 'open',
            });
            expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('cause.id', 'ASC');

            expect(pins).toHaveLength(2);
            expect(pins[0]).toEqual({
                id: 101,
                title: 'Gran Sembratón Comunitaria',
                latitude: 6.2442,
                longitude: -75.5812,
                category: {
                    id: 2,
                    name: 'Medio Ambiente',
                },
            });
            expect(pins[1]).toEqual({
                id: 102,
                title: 'Jornada de Limpieza de Río',
                latitude: 6.25,
                longitude: -75.57,
                category: {
                    id: 2,
                    name: 'Medio Ambiente',
                },
            });
        });

        it('29. should exclude causes with missing, empty or non-numeric coordinates', async () => {
            const causeWithEmptyCoords: Cause = {
                ...mockCause1,
                id: 104,
                location_latitude: '',
                location_longitude: '',
            };
            const causeWithInvalidCoords: Cause = {
                ...mockCause1,
                id: 105,
                location_latitude: 'invalid_lat',
                location_longitude: 'invalid_lng',
            };

            mockQueryBuilder.getMany.mockResolvedValue([mockCause1, causeWithEmptyCoords, causeWithInvalidCoords]);

            const pins = await service.getMapPins();

            expect(pins).toHaveLength(1);
            expect(pins[0].id).toBe(101);
            expect(pins[0].latitude).toBe(6.2442);
            expect(pins[0].longitude).toBe(-75.5812);
        });

        it('30. should accept valid coordinates at the geographical boundaries', async () => {
            const boundaryCauseNorthEast: Cause = {
                ...mockCause1,
                id: 107,
                location_latitude: '90',
                location_longitude: '180',
            };
            const boundaryCauseSouthWest: Cause = {
                ...mockCause1,
                id: 108,
                location_latitude: '-90',
                location_longitude: '-180',
            };

            mockQueryBuilder.getMany.mockResolvedValue([boundaryCauseNorthEast, boundaryCauseSouthWest]);

            const pins = await service.getMapPins();

            expect(pins).toHaveLength(2);
            expect(pins[0].latitude).toBe(90);
            expect(pins[0].longitude).toBe(180);
            expect(pins[1].latitude).toBe(-90);
            expect(pins[1].longitude).toBe(-180);
        });

        it('31. should exclude causes with latitudes outside [-90, 90]', async () => {
            const causeBeyondNorth: Cause = {
                ...mockCause1,
                id: 109,
                location_latitude: '90.0001',
                location_longitude: '0',
            };
            const causeBeyondSouth: Cause = {
                ...mockCause1,
                id: 110,
                location_latitude: '-90.0001',
                location_longitude: '0',
            };
            const causeExtremeLat: Cause = {
                ...mockCause1,
                id: 111,
                location_latitude: '150',
                location_longitude: '0',
            };

            mockQueryBuilder.getMany.mockResolvedValue([causeBeyondNorth, causeBeyondSouth, causeExtremeLat]);

            const pins = await service.getMapPins();

            expect(pins).toEqual([]);
        });

        it('32. should exclude causes with longitudes outside [-180, 180]', async () => {
            const causeBeyondEast: Cause = {
                ...mockCause1,
                id: 112,
                location_latitude: '0',
                location_longitude: '180.0001',
            };
            const causeBeyondWest: Cause = {
                ...mockCause1,
                id: 113,
                location_latitude: '0',
                location_longitude: '-180.0001',
            };
            const causeExtremeLng: Cause = {
                ...mockCause1,
                id: 114,
                location_latitude: '0',
                location_longitude: '-200',
            };

            mockQueryBuilder.getMany.mockResolvedValue([causeBeyondEast, causeBeyondWest, causeExtremeLng]);

            const pins = await service.getMapPins();

            expect(pins).toEqual([]);
        });

        it('33. should exclude causes with non-finite coordinate values', async () => {
            const causeInfinityLat: Cause = {
                ...mockCause1,
                id: 115,
                location_latitude: 'Infinity',
                location_longitude: '0',
            };
            const causeNegInfinityLat: Cause = {
                ...mockCause1,
                id: 116,
                location_latitude: '-Infinity',
                location_longitude: '0',
            };
            const causeInfinityLng: Cause = {
                ...mockCause1,
                id: 117,
                location_latitude: '0',
                location_longitude: 'Infinity',
            };
            const causeNegInfinityLng: Cause = {
                ...mockCause1,
                id: 118,
                location_latitude: '0',
                location_longitude: '-Infinity',
            };

            mockQueryBuilder.getMany.mockResolvedValue([
                causeInfinityLat,
                causeNegInfinityLat,
                causeInfinityLng,
                causeNegInfinityLng,
            ]);

            const pins = await service.getMapPins();

            expect(pins).toEqual([]);
        });

        it('34. should return an empty array when no eligible causes have valid coordinates', async () => {
            mockQueryBuilder.getMany.mockResolvedValue([]);

            const pins = await service.getMapPins();

            expect(pins).toEqual([]);
        });

        it('35. should include causes even if the volunteer has already applied to them', async () => {
            (submissionRepository.find as any).mockResolvedValue([{ cause_id: 101 }]);

            const pins = await service.getMapPins();

            expect(submissionRepository.find).not.toHaveBeenCalled();
            expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith(
                expect.stringContaining('NOT IN'),
                expect.anything(),
            );
            expect(pins).toHaveLength(2);
        });

        it('36. should handle causes without category gracefully', async () => {
            const causeWithoutCategory: Cause = {
                ...mockCause1,
                id: 106,
                category: null as any,
            };
            mockQueryBuilder.getMany.mockResolvedValue([causeWithoutCategory]);

            const pins = await service.getMapPins();

            expect(pins).toHaveLength(1);
            expect(pins[0].id).toBe(106);
            expect(pins[0].category).toBeUndefined();
        });
    });

    describe('US-3.2.2: Open cause preview from map', () => {
        it('37. should return full cause preview card with all details and capacity calculations', async () => {
            (submissionRepository.count as any).mockImplementation((opts: any) => {
                const statusOp = opts?.where?.status;
                if (statusOp) {
                    if (typeof statusOp._sql === 'function') statusOp._sql('s.status');
                    if (typeof statusOp._value === 'function') statusOp._value('s.status');
                    if (typeof statusOp.value === 'function') statusOp.value('s.status');
                    if (typeof statusOp.getSql === 'function') statusOp.getSql('s.status');
                }
                return Promise.resolve(5);
            });

            const card = await service.getCausePreview(101);

            expect(causeRepository.findOne).toHaveBeenCalledWith({
                where: { id: 101 },
                relations: {
                    organizer: true,
                    category: true,
                },
            });
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
            expect(card.spots_available).toBe(15);
            expect(card.occupied_spots).toBe(5);
            expect(card.is_full).toBe(false);
        });

        it('38. should throw CauseNotFoundException when the requested cause does not exist', async () => {
            (causeRepository.findOne as any).mockResolvedValue(null);

            await expect(service.getCausePreview(999)).rejects.toThrow(CauseNotFoundException);
        });

        it('39. should throw CauseNotAvailableException when the cause is not available', async () => {
            (causeRepository.findOne as any).mockResolvedValue({
                ...mockCause1,
                is_available: false,
            });

            await expect(service.getCausePreview(101)).rejects.toThrow(CauseNotAvailableException);
        });

        it('40. should throw CauseNotAvailableException when the cause is not open for applications', async () => {
            (causeRepository.findOne as any).mockResolvedValue({
                ...mockCause1,
                progress: 'in_progress',
            });

            await expect(service.getCausePreview(101)).rejects.toThrow(CauseNotAvailableException);
        });

        it('41. should throw CauseNotAvailableException when the cause has already ended', async () => {
            (causeRepository.findOne as any).mockResolvedValue({
                ...mockCause1,
                end_date: new Date('2020-01-01'),
            });

            await expect(service.getCausePreview(101)).rejects.toThrow(CauseNotAvailableException);
        });

        it('42. should correctly compute is_full true and spots_available 0 when capacity is reached', async () => {
            (causeRepository.findOne as any).mockResolvedValue(mockCauseFull);
            (submissionRepository.count as any).mockResolvedValue(5);

            const card = await service.getCausePreview(103);

            expect(card.capacity).toBe(5);
            expect(card.occupied_spots).toBe(5);
            expect(card.spots_available).toBe(0);
            expect(card.is_full).toBe(true);
        });

        it('43. should handle preview of causes with unlimited capacity', async () => {
            (causeRepository.findOne as any).mockResolvedValue({
                ...mockCause1,
                capacity: null as any,
            });
            (submissionRepository.count as any).mockResolvedValue(8);

            const card = await service.getCausePreview(101);

            expect(card.capacity).toBeNull();
            expect(card.spots_available).toBeNull();
            expect(card.occupied_spots).toBe(8);
            expect(card.is_full).toBe(false);
        });

        it('44. should validate causeId parameter using PositiveIntPipe', () => {
            expect(positiveIntPipe.transform('101', { type: 'param', data: 'causeId' })).toBe(101);
            expect(() => positiveIntPipe.transform('0', { type: 'param', data: 'causeId' })).toThrow(
                "Parameter 'causeId' must be a positive integer greater than 0.",
            );
            expect(() => positiveIntPipe.transform('-5', { type: 'param', data: 'causeId' })).toThrow(
                "Parameter 'causeId' must be a positive integer greater than 0.",
            );
            expect(() => positiveIntPipe.transform('abc', { type: 'param', data: 'causeId' })).toThrow(
                "Parameter 'causeId' must be a valid integer.",
            );
            expect(() => positiveIntPipe.transform('xyz', { type: 'param' })).toThrow(
                "Parameter 'id' must be a valid integer.",
            );
        });
    });

    describe('MatchesController: Authentication and Authorization', () => {
        let controller: MatchesController;
        let reflector: Reflector;
        let rolesGuard: RolesGuard;

        beforeEach(() => {
            controller = new MatchesController(service);
            reflector = new Reflector();
            rolesGuard = new RolesGuard(reflector);
        });

        const createMockContext = (handler: (...args: any[]) => any, user?: any): ExecutionContext =>
            ({
                getHandler: () => handler,
                getClass: () => MatchesController,
                switchToHttp: () => ({
                    getRequest: () => ({ user }),
                }),
            }) as unknown as ExecutionContext;

        it('45. should bind JwtAuthGuard and RolesGuard to getMapPins endpoint', () => {
            const getMapPinsHandler = (controller as any).getMapPins;
            const guards = reflector.get<any[]>('__guards__', getMapPinsHandler);
            expect(guards).toBeDefined();
            expect(guards).toContain(JwtAuthGuard);
            expect(guards).toContain(RolesGuard);
        });

        it('46. should require volunteer role on getMapPins endpoint', () => {
            const getMapPinsHandler = (controller as any).getMapPins;
            const roles = reflector.get<string[]>(ROLES_KEY, getMapPinsHandler);
            expect(roles).toEqual(['volunteer']);
        });

        it('47. should bind JwtAuthGuard and RolesGuard to getCausePreview endpoint', () => {
            const getCausePreviewHandler = (controller as any).getCausePreview;
            const guards = reflector.get<any[]>('__guards__', getCausePreviewHandler);
            expect(guards).toBeDefined();
            expect(guards).toContain(JwtAuthGuard);
            expect(guards).toContain(RolesGuard);
        });

        it('48. should require volunteer role on getCausePreview endpoint', () => {
            const getCausePreviewHandler = (controller as any).getCausePreview;
            const roles = reflector.get<string[]>(ROLES_KEY, getCausePreviewHandler);
            expect(roles).toEqual(['volunteer']);
        });

        it('49. should delegate getMapPins call to MatchesService', async () => {
            const pinsMock = [{ id: 101, title: 'Cause', latitude: 6.2, longitude: -75.5 }];
            const getMapPinsSpy = jest.spyOn(service, 'getMapPins').mockResolvedValue(pinsMock);

            const result = await controller.getMapPins();

            expect(getMapPinsSpy).toHaveBeenCalled();
            expect(result).toBe(pinsMock);
        });

        it('50. should delegate getCausePreview call to MatchesService', async () => {
            const previewMock = { id: 101, title: 'Cause' };
            const getCausePreviewSpy = jest.spyOn(service, 'getCausePreview').mockResolvedValue(previewMock as any);

            const result = await controller.getCausePreview(101);

            expect(getCausePreviewSpy).toHaveBeenCalledWith(101);
            expect(result).toBe(previewMock);
        });

        it('51. should allow access when user has volunteer role', () => {
            const getMapPinsHandler = (controller as any).getMapPins;
            const getCausePreviewHandler = (controller as any).getCausePreview;
            const context = createMockContext(getMapPinsHandler, { id: 1, role: 'volunteer' });
            expect(rolesGuard.canActivate(context)).toBe(true);

            const previewContext = createMockContext(getCausePreviewHandler, {
                id: 1,
                role: { name: 'volunteer' },
            });
            expect(rolesGuard.canActivate(previewContext)).toBe(true);
        });

        it('52. should reject with UnauthorizedException when user is unauthenticated', () => {
            const getMapPinsHandler = (controller as any).getMapPins;
            const context = createMockContext(getMapPinsHandler, null);
            expect(() => rolesGuard.canActivate(context)).toThrow(UnauthorizedException);
        });

        it('53. should reject with ForbiddenException when user has no role assigned', () => {
            const getMapPinsHandler = (controller as any).getMapPins;
            const context = createMockContext(getMapPinsHandler, { id: 1 });
            expect(() => rolesGuard.canActivate(context)).toThrow(ForbiddenException);
        });

        it('54. should reject with ForbiddenException when user role is not volunteer', () => {
            const getMapPinsHandler = (controller as any).getMapPins;
            const getCausePreviewHandler = (controller as any).getCausePreview;
            const contextOrganizer = createMockContext(getMapPinsHandler, { id: 1, role: 'organizer' });
            expect(() => rolesGuard.canActivate(contextOrganizer)).toThrow(ForbiddenException);

            const contextAdmin = createMockContext(getCausePreviewHandler, { id: 2, role: 'admin' });
            expect(() => rolesGuard.canActivate(contextAdmin)).toThrow(ForbiddenException);
        });
    });
});
