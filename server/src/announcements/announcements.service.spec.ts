import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    NotFoundException,
    ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnnouncementsService } from './announcements.service';
import { Announcement } from './entities/announcement.entity';
import { Cause } from '../causes/entities/cause.entity';
import { Organizer } from '../organizations/entities/organizer.entity';
import { Image } from '../media/entities/image.entity';
import { AnnouncementReaction } from './entities/announcement-reaction.entity';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { CreateImageDto } from '../media/image/dto/create-image.dto';
import { LikeAnnouncementDto } from './dto/like-announcement.dto';
import { CauseNotFoundException, OrganizerNotFoundException } from '../common/exceptions';

describe('AnnouncementsService', () => {
    let service: AnnouncementsService;
    let announcementRepository: jest.Mocked<Partial<Repository<Announcement>>>;
    let causeRepository: jest.Mocked<Partial<Repository<Cause>>>;
    let organizerRepository: jest.Mocked<Partial<Repository<Organizer>>>;
    let imageRepository: jest.Mocked<Partial<Repository<Image>>>;
    let announcementReactionRepository: jest.Mocked<Partial<Repository<AnnouncementReaction>>>;
    let validationPipe: ValidationPipe;

    const mockOrganizerUser = {
        id: 10,
        role: 'organizer',
        permissions: ['manage_announcements'],
    };

    const mockAdminUser = {
        id: 1,
        role: 'admin',
        permissions: ['manage_announcements'],
    };

    const mockOtherOrganizerUser = {
        id: 99,
        role: 'organizer',
        permissions: ['manage_announcements'],
    };

    const mockVolunteerUser = {
        id: 5,
        role: 'volunteer',
        permissions: ['react_announcements'],
    };

    const mockOrganizer: Organizer = {
        id: 5,
        user_id: 10,
        is_organization: true,
        name: 'Fundación Huellas Verdes',
        description: 'Organización ambiental',
        website: 'https://huellasverdes.org',
        verification_file: 'doc.pdf',
        verification_status: 'verified',
        organization_type_id: 1,
        organizationType: {} as any,
        user: {} as any,
        causes: [],
    };

    const mockCause: Cause = {
        id: 1,
        organizer_id: 5,
        category_id: 1,
        title: 'Gran Sembratón',
        cover_image_url: 'https://images.kindly.org/causes/sembraton.jpg',
        description: 'Jornada de siembra comunitaria',
        capacity: 50,
        created_at: new Date(),
        start_date: new Date(),
        end_date: new Date(),
        address: 'Parque Ecológico',
        is_available: true,
        location_latitude: '6.2442',
        location_longitude: '-75.5812',
        progress: 'open',
        qr_code: 'QR-CAUSE-001',
        organizer: mockOrganizer,
        category: {} as any,
        supplies: [],
        images: [],
        announcements: [],
        submissions: [],
        attendances: [],
    };

    const mockAnnouncement: Announcement = {
        id: 101,
        cause_id: 1,
        title: 'Recomendaciones Sembratón',
        text: 'Llevar botas y protector solar.',
        likes: 0,
        created_at: new Date(),
        cause: mockCause,
        images: [],
        announcementReaction: [],
    };

    const mockImage: Image = {
        id: 501,
        image_url: 'https://images.kindly.org/announcements/foto.jpg',
        announcement_id: 101,
        cause_id: null as any,
        cause: null as any,
        announcement: mockAnnouncement,
    };

    beforeEach(async () => {
        announcementRepository = {
            create: jest.fn((dto: any) => ({ ...dto, id: 101, created_at: new Date() })),
            save: jest.fn((entity: any) => Promise.resolve({ ...entity, id: entity.id || 101 })),
            find: jest.fn(() => Promise.resolve([mockAnnouncement])),
            findOne: jest.fn(() => Promise.resolve(mockAnnouncement)),
        };

        causeRepository = {
            findOne: jest.fn(() => Promise.resolve(mockCause)),
        };

        organizerRepository = {
            findOne: jest.fn(() => Promise.resolve(mockOrganizer)),
        };

        imageRepository = {
            create: jest.fn((dto: any) => ({ ...dto, id: 501 })),
            save: jest.fn((entity: any) => Promise.resolve({ ...entity, id: entity.id || 501 })),
            find: jest.fn(() => Promise.resolve([mockImage])),
            findOne: jest.fn(() => Promise.resolve(mockImage)),
        };

        announcementReactionRepository = {
            create: jest.fn((dto: any) => ({ ...dto, created_at: new Date() })),
            save: jest.fn((entity: any) => Promise.resolve({ ...entity })),
            findOne: jest.fn(() => Promise.resolve(null)),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AnnouncementsService,
                {
                    provide: getRepositoryToken(Announcement),
                    useValue: announcementRepository,
                },
                {
                    provide: getRepositoryToken(Cause),
                    useValue: causeRepository,
                },
                {
                    provide: getRepositoryToken(Organizer),
                    useValue: organizerRepository,
                },
                {
                    provide: getRepositoryToken(Image),
                    useValue: imageRepository,
                },
                {
                    provide: getRepositoryToken(AnnouncementReaction),
                    useValue: announcementReactionRepository,
                },
            ],
        }).compile();

        service = module.get<AnnouncementsService>(AnnouncementsService);

        validationPipe = new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        });
    });

    describe('US-2.3.1: Create cause announcements', () => {
        const validDto: CreateAnnouncementDto = {
            title: 'Punto de encuentro y recomendaciones',
            text: 'Nos vemos en el km 14 a las 8:00 AM.',
        };

        it('1. should create an announcement successfully for the cause owner', async () => {
            const result = await service.create(1, mockOrganizerUser, validDto);

            expect(organizerRepository.findOne).toHaveBeenCalledWith({
                where: { user_id: mockOrganizerUser.id },
            });
            expect(causeRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(announcementRepository.create).toHaveBeenCalledWith({
                cause_id: 1,
                title: validDto.title,
                text: validDto.text,
                likes: 0,
            });
            expect(announcementRepository.save).toHaveBeenCalled();
            expect(result).toBeDefined();
            expect(result.title).toBe(validDto.title);
            expect(result.text).toBe(validDto.text);
            expect(result.cause_id).toBe(1);
        });

        it('2. should initialize likes to zero', async () => {
            const result = await service.create(1, mockOrganizerUser, validDto);

            expect(announcementRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    likes: 0,
                }),
            );
            expect(result.likes).toBe(0);
        });

        it('3. should reject when cause does not exist', async () => {
            (causeRepository.findOne as any).mockResolvedValue(null);

            await expect(service.create(999, mockOrganizerUser, validDto)).rejects.toThrow(CauseNotFoundException);
            expect(announcementRepository.save).not.toHaveBeenCalled();
        });

        it('4. should reject when organizer does not exist', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(null);

            await expect(service.create(1, { id: 9999, role: 'organizer' }, validDto)).rejects.toThrow(
                OrganizerNotFoundException,
            );
            expect(announcementRepository.save).not.toHaveBeenCalled();
        });

        it('5. should reject when organizer does not own the cause', async () => {
            const anotherOrganizer: Organizer = {
                ...mockOrganizer,
                id: 88,
                user_id: mockOtherOrganizerUser.id,
            };
            (organizerRepository.findOne as any).mockResolvedValue(anotherOrganizer);

            await expect(service.create(1, mockOtherOrganizerUser, validDto)).rejects.toThrow(ForbiddenException);
            expect(announcementRepository.save).not.toHaveBeenCalled();
        });

        it('6. should allow admin to create an announcement without ownership check', async () => {
            const result = await service.create(1, mockAdminUser, validDto);

            expect(organizerRepository.findOne).not.toHaveBeenCalled();
            expect(causeRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(announcementRepository.save).toHaveBeenCalled();
            expect(result.cause_id).toBe(1);
        });

        it('7. should preserve the cause_id from the route/service input', async () => {
            const customCauseId = 42;
            (causeRepository.findOne as any).mockResolvedValue({
                ...mockCause,
                id: customCauseId,
            });

            await service.create(customCauseId, mockOrganizerUser, validDto);

            expect(announcementRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    cause_id: customCauseId,
                }),
            );
        });

        it('8. should not allow client-controlled likes/cause ownership fields through the DTO', async () => {
            const maliciousPayload = {
                title: 'Announcement title',
                text: 'Announcement text',
                likes: 9999,
                cause_id: 999,
                organizer_id: 123,
                user_id: 456,
            };

            await expect(
                validationPipe.transform(maliciousPayload, {
                    type: 'body',
                    metatype: CreateAnnouncementDto,
                }),
            ).rejects.toThrow(BadRequestException);
        });

        it('9. should reject CreateAnnouncementDto when title is empty or missing', async () => {
            const emptyTitlePayload = {
                title: '',
                text: 'Some valid text',
            };

            await expect(
                validationPipe.transform(emptyTitlePayload, {
                    type: 'body',
                    metatype: CreateAnnouncementDto,
                }),
            ).rejects.toThrow(BadRequestException);
        });

        it('10. should reject CreateAnnouncementDto when text is empty or missing', async () => {
            const emptyTextPayload = {
                title: 'Valid title',
                text: '',
            };

            await expect(
                validationPipe.transform(emptyTextPayload, {
                    type: 'body',
                    metatype: CreateAnnouncementDto,
                }),
            ).rejects.toThrow(BadRequestException);
        });

        it('11. should list announcements for a valid cause', async () => {
            const result = await service.findAllByCause(1);

            expect(causeRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(announcementRepository.find).toHaveBeenCalledWith({
                where: { cause_id: 1 },
                order: { created_at: 'DESC' },
            });
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe(101);
        });

        it('12. should reject listing announcements when cause does not exist', async () => {
            (causeRepository.findOne as any).mockResolvedValue(null);

            await expect(service.findAllByCause(999)).rejects.toThrow(CauseNotFoundException);
            expect(announcementRepository.find).not.toHaveBeenCalled();
        });
    });

    describe('US-2.3.2: Add images to announcements', () => {
        const validImageDto: CreateImageDto = {
            image_url: 'https://images.kindly.org/announcements/mapa_punto_encuentro.png',
        };

        it('13. should attach an image successfully when organizer owns the announcement cause', async () => {
            const result = await service.addImage(101, mockOrganizerUser, validImageDto);

            expect(organizerRepository.findOne).toHaveBeenCalledWith({
                where: { user_id: mockOrganizerUser.id },
            });
            expect(announcementRepository.findOne).toHaveBeenCalledWith({
                where: { id: 101 },
                relations: ['cause'],
            });
            expect(imageRepository.create).toHaveBeenCalledWith({
                image_url: validImageDto.image_url,
                announcement_id: 101,
                cause_id: null,
            });
            expect(imageRepository.save).toHaveBeenCalled();
            expect(result.id).toBe(501);
            expect(result.announcement_id).toBe(101);
            expect(result.cause_id).toBeNull();
        });

        it('14. should allow admin to attach an image to any announcement without ownership check', async () => {
            const result = await service.addImage(101, mockAdminUser, validImageDto);

            expect(organizerRepository.findOne).not.toHaveBeenCalled();
            expect(announcementRepository.findOne).toHaveBeenCalledWith({
                where: { id: 101 },
                relations: ['cause'],
            });
            expect(imageRepository.save).toHaveBeenCalled();
            expect(result.announcement_id).toBe(101);
        });

        it('15. should reject when announcement does not exist', async () => {
            (announcementRepository.findOne as any).mockResolvedValue(null);

            await expect(service.addImage(999, mockOrganizerUser, validImageDto)).rejects.toThrow(NotFoundException);
            expect(imageRepository.save).not.toHaveBeenCalled();
        });

        it('16. should reject when organizer does not exist', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(null);

            await expect(service.addImage(101, { id: 888, role: 'organizer' }, validImageDto)).rejects.toThrow(
                OrganizerNotFoundException,
            );
            expect(imageRepository.save).not.toHaveBeenCalled();
        });

        it('17. should reject when organizer does not own the cause associated with the announcement', async () => {
            const otherOrganizer: Organizer = {
                ...mockOrganizer,
                id: 77,
                user_id: mockOtherOrganizerUser.id,
            };
            (organizerRepository.findOne as any).mockResolvedValue(otherOrganizer);

            await expect(service.addImage(101, mockOtherOrganizerUser, validImageDto)).rejects.toThrow(
                ForbiddenException,
            );
            expect(imageRepository.save).not.toHaveBeenCalled();
        });

        it('18. should assign announcement_id from route and ensure cause_id is null', async () => {
            const customAnnouncementId = 205;
            (announcementRepository.findOne as any).mockResolvedValue({
                ...mockAnnouncement,
                id: customAnnouncementId,
            });

            await service.addImage(customAnnouncementId, mockOrganizerUser, validImageDto);

            expect(imageRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    announcement_id: customAnnouncementId,
                    cause_id: null,
                    image_url: validImageDto.image_url,
                }),
            );
        });

        it('19. should list announcement images successfully', async () => {
            const images = await service.findImagesByAnnouncement(101);

            expect(announcementRepository.findOne).toHaveBeenCalledWith({
                where: { id: 101 },
            });
            expect(imageRepository.find).toHaveBeenCalledWith({
                where: { announcement_id: 101 },
            });
            expect(images).toHaveLength(1);
            expect(images[0].announcement_id).toBe(101);
        });

        it('20. should reject listing images when announcement does not exist', async () => {
            (announcementRepository.findOne as any).mockResolvedValue(null);

            await expect(service.findImagesByAnnouncement(999)).rejects.toThrow(NotFoundException);
            expect(imageRepository.find).not.toHaveBeenCalled();
        });

        it('21. should reject CreateImageDto when image_url is empty or invalid URL', async () => {
            const invalidUrlPayload = {
                image_url: 'not-a-valid-url',
            };

            await expect(
                validationPipe.transform(invalidUrlPayload, {
                    type: 'body',
                    metatype: CreateImageDto,
                }),
            ).rejects.toThrow(BadRequestException);

            const emptyPayload = {
                image_url: '',
            };

            await expect(
                validationPipe.transform(emptyPayload, {
                    type: 'body',
                    metatype: CreateImageDto,
                }),
            ).rejects.toThrow(BadRequestException);
        });

        it('22. should reject CreateImageDto when client sends forbidden properties', async () => {
            const forbiddenFieldsPayload = {
                image_url: 'https://images.kindly.org/announcements/foto.jpg',
                announcement_id: 99,
                cause_id: 55,
                id: 10,
            };

            await expect(
                validationPipe.transform(forbiddenFieldsPayload, {
                    type: 'body',
                    metatype: CreateImageDto,
                }),
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('US-2.3.3: Like announcements', () => {
        it('23. should like an announcement successfully and increment likes count by 1', async () => {
            const announcementToLike = { ...mockAnnouncement, likes: 5 };
            (announcementRepository.findOne as any).mockResolvedValue(announcementToLike);

            const result = await service.like(101, mockVolunteerUser);

            expect(announcementRepository.findOne).toHaveBeenCalledWith({ where: { id: 101 } });
            expect(announcementReactionRepository.findOne).toHaveBeenCalledWith({
                where: { announcement_id: 101, user_id: mockVolunteerUser.id },
            });
            expect(announcementReactionRepository.save).toHaveBeenCalled();
            expect(announcementRepository.save).toHaveBeenCalledWith(expect.objectContaining({ id: 101, likes: 6 }));
            expect(result).toEqual({
                message: 'Announcement liked successfully',
                announcement_id: 101,
                likes: 6,
            });
        });

        it('24. should reject when the announcement does not exist', async () => {
            (announcementRepository.findOne as any).mockResolvedValue(null);

            await expect(service.like(999, mockVolunteerUser)).rejects.toThrow(NotFoundException);
            expect(announcementReactionRepository.save).not.toHaveBeenCalled();
            expect(announcementRepository.save).not.toHaveBeenCalled();
        });

        it('25. should reject when the user has already liked the announcement', async () => {
            (announcementReactionRepository.findOne as any).mockResolvedValue({
                announcement_id: 101,
                user_id: mockVolunteerUser.id,
                reaction_id: 2,
            });

            await expect(service.like(101, mockVolunteerUser)).rejects.toThrow(ConflictException);
            expect(announcementReactionRepository.save).not.toHaveBeenCalled();
            expect(announcementRepository.save).not.toHaveBeenCalled();
        });

        it("26. should persist the authenticated user's id", async () => {
            await service.like(101, mockVolunteerUser);

            expect(announcementReactionRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    user_id: mockVolunteerUser.id,
                }),
            );
        });

        it('27. should use reaction_id 2 for the like', async () => {
            await service.like(101, mockVolunteerUser);

            expect(announcementReactionRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    reaction_id: 2,
                }),
            );
        });

        it('28. should not increment likes when a duplicate like is attempted', async () => {
            const announcementBefore = { ...mockAnnouncement, likes: 3 };
            (announcementRepository.findOne as any).mockResolvedValue(announcementBefore);
            (announcementReactionRepository.findOne as any).mockResolvedValue({
                announcement_id: 101,
                user_id: mockVolunteerUser.id,
                reaction_id: 2,
            });

            await expect(service.like(101, mockVolunteerUser)).rejects.toThrow(ConflictException);
            expect(announcementRepository.save).not.toHaveBeenCalled();
            expect(announcementBefore.likes).toBe(3);
        });

        it('29. should handle database unique constraint violation (code 23505) as ConflictException', async () => {
            (announcementReactionRepository.save as any).mockRejectedValue({ code: '23505' });

            await expect(service.like(101, mockVolunteerUser)).rejects.toThrow(ConflictException);
            expect(announcementRepository.save).not.toHaveBeenCalled();
        });

        it('30. should reject LikeAnnouncementDto when client sends any forbidden properties', async () => {
            const forbiddenPayload = {
                user_id: 5,
                reaction_id: 2,
                announcement_id: 101,
                likes: 99,
            };

            await expect(
                validationPipe.transform(forbiddenPayload, {
                    type: 'body',
                    metatype: LikeAnnouncementDto,
                }),
            ).rejects.toThrow(BadRequestException);
        });
    });
});
