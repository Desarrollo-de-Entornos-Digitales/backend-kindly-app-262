import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { BadRequestException, NotFoundException, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchesService } from './matches.service';
import { Cause } from '../causes/entities/cause.entity';
import { Volunteer } from '../volunteers/entities/volunteer.entity';
import { Submission } from '../participations/entities/submission.entity';
import { SubmissionService } from '../participations/submission/submission.service';
import { SubmissionStatus } from '../participations/submission/submission-status.enum';
import {
    CauseNotAvailableException,
    CauseNotFoundException,
    CauseQuotaFullException,
    DuplicateSubmissionException,
} from '../common/exceptions';
import { GetDeckQueryDto } from './dto/get-deck-query.dto';
import { CreateMatchDto } from './dto/create-match.dto';

describe('MatchesService', () => {
    let service: MatchesService;
    let causeRepository: jest.Mocked<Partial<Repository<Cause>>>;
    let volunteerRepository: jest.Mocked<Partial<Repository<Volunteer>>>;
    let submissionRepository: jest.Mocked<Partial<Repository<Submission>>>;
    let submissionService: jest.Mocked<Partial<SubmissionService>>;
    let mockQueryBuilder: any;
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
        user: {} as any,
        volunteerSkills: [],
        volunteerCategories: [],
        volunteerAchievements: [],
        submissions: [],
        attendances: [],
    };

    const mockOrganizer = {
        id: 1,
        name: 'Fundación Huellas Verdes',
        verification_status: 'verified',
    };

    const mockCategory = {
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
        organizer: mockOrganizer as any,
        category: mockCategory as any,
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
        organizer: mockOrganizer as any,
        category: mockCategory as any,
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
        organizer: mockOrganizer as any,
        category: mockCategory as any,
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
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue([mockCause1, mockCause2]),
        };

        causeRepository = {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
        };

        volunteerRepository = {
            findOne: jest.fn(() => Promise.resolve(mockVolunteer)),
        };

        submissionRepository = {
            find: jest.fn(() => Promise.resolve([])),
            count: jest.fn(() => Promise.resolve(0)),
        };

        submissionService = {
            create: jest.fn(() => Promise.resolve(mockCreatedSubmission)),
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
                where: { volunteer_id: mockVolunteer.id },
                select: ['cause_id'],
            });
            expect(causeRepository.createQueryBuilder).toHaveBeenCalledWith('cause');
            expect(mockQueryBuilder.where).toHaveBeenCalledWith('cause.is_available = :isAvailable', {
                isAvailable: true,
            });
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('cause.progress = :progress', {
                progress: 'open',
            });
            expect(cards).toHaveLength(2);
            expect(cards[0].id).toBe(101);
            expect(cards[1].id).toBe(102);
        });

        it('2. should exclude causes where the volunteer already has a submission', async () => {
            (submissionRepository.find as any).mockResolvedValue([{ cause_id: 101 }]);

            await service.getDeck(mockUser);

            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('cause.id NOT IN (:...excludedCauseIds)', {
                excludedCauseIds: [101],
            });
        });

        it('3. should exclude causes that have reached maximum capacity', async () => {
            mockQueryBuilder.getMany.mockResolvedValue([mockCause1, mockCauseFull]);
            (submissionRepository.count as any).mockImplementation((options: any) => {
                if (options?.where?.cause_id === 103) {
                    return Promise.resolve(5);
                }
                return Promise.resolve(2);
            });

            const cards = await service.getDeck(mockUser);

            expect(cards).toHaveLength(1);
            expect(cards[0].id).toBe(101);
        });

        it('4. should handle causes without capacity limit as unlimited spots', async () => {
            const mockCauseNoLimit: Cause = {
                ...mockCause1,
                capacity: null as any,
            };
            mockQueryBuilder.getMany.mockResolvedValue([mockCauseNoLimit]);
            (submissionRepository.count as any).mockResolvedValue(4);

            const cards = await service.getDeck(mockUser);

            expect(cards).toHaveLength(1);
            expect(cards[0].capacity).toBeNull();
            expect(cards[0].spots_available).toBeNull();
            expect(cards[0].occupied_spots).toBe(4);
            expect(cards[0].is_full).toBe(false);
        });

        it('5. should throw NotFoundException when the user does not have a volunteer profile', async () => {
            (volunteerRepository.findOne as any).mockResolvedValue(null);

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
            (submissionRepository.count as any).mockResolvedValue(3);

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
                } as any,
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

        it('13. should use default justification when justification is omitted or empty', async () => {
            await service.match(5, { cause_id: 101 });

            expect(submissionService.create).toHaveBeenCalledWith(5, {
                cause_id: 101,
                justification: 'Postulación generada automáticamente mediante Match en Kindly.',
            });

            await service.match(5, { cause_id: 101, justification: '   ' });

            expect(submissionService.create).toHaveBeenCalledWith(5, {
                cause_id: 101,
                justification: 'Postulación generada automáticamente mediante Match en Kindly.',
            });
        });

        it('14. should correctly delegate to SubmissionService with authenticated userId and causeId', async () => {
            await service.match(99, { cause_id: 202 });

            expect(submissionService.create).toHaveBeenCalledTimes(1);
            expect(submissionService.create).toHaveBeenCalledWith(99, {
                cause_id: 202,
                justification: 'Postulación generada automáticamente mediante Match en Kindly.',
            });
        });

        it('15. should propagate CauseNotFoundException when the cause does not exist', async () => {
            (submissionService.create as any).mockRejectedValue(new CauseNotFoundException(999));

            await expect(service.match(5, { cause_id: 999 })).rejects.toThrow(CauseNotFoundException);
        });

        it('16. should propagate CauseNotAvailableException when cause is not available or has ended', async () => {
            (submissionService.create as any).mockRejectedValue(new CauseNotAvailableException());

            await expect(service.match(5, { cause_id: 101 })).rejects.toThrow(CauseNotAvailableException);
        });

        it('17. should propagate DuplicateSubmissionException when volunteer already applied to the cause', async () => {
            (submissionService.create as any).mockRejectedValue(new DuplicateSubmissionException());

            await expect(service.match(5, { cause_id: 101 })).rejects.toThrow(DuplicateSubmissionException);
        });

        it('18. should propagate CauseQuotaFullException when cause capacity is full', async () => {
            (submissionService.create as any).mockRejectedValue(new CauseQuotaFullException());

            await expect(service.match(5, { cause_id: 101 })).rejects.toThrow(CauseQuotaFullException);
        });

        it('19. should propagate NotFoundException when volunteer profile is not found', async () => {
            (submissionService.create as any).mockRejectedValue(
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
});
