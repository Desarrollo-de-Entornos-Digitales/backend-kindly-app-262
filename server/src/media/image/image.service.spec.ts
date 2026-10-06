import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { BadRequestException, ForbiddenException, NotFoundException, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImageService } from './image.service';
import { Image } from '../entities/image.entity';
import { Cause } from '../../causes/entities/cause.entity';
import { Organizer } from '../../organizations/entities/organizer.entity';
import { CreateImageDto } from './dto/create-image.dto';
import { CauseNotFoundException, OrganizerNotFoundException } from '../../common/exceptions';
import { PositiveIntPipe } from '../../common/pipes/positive-int.pipe';

describe('ImageService', () => {
    let service: ImageService;
    let imageRepository: jest.Mocked<Partial<Repository<Image>>>;
    let causeRepository: jest.Mocked<Partial<Repository<Cause>>>;
    let organizerRepository: jest.Mocked<Partial<Repository<Organizer>>>;

    const mockOrganizer: Organizer = {
        id: 1,
        user_id: 2,
        is_organization: true,
        name: 'Fundación Huellas Verdes',
        description: 'Organización ambiental',
        website: 'https://huellasverdes.org',
        verification_file: 'rut.pdf',
        verification_status: 'verified',
        organization_type_id: 1,
        organizationType: {} as any,
        user: {} as any,
        causes: [],
    };

    const mockCause: Cause = {
        id: 1,
        organizer_id: 1,
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

    const mockImage: Image = {
        id: 1,
        cause_id: 1,
        announcement_id: null as any,
        image_url: 'https://images.kindly.org/causes/galeria_sembraton_1.jpg',
        cause: mockCause,
        announcement: null as any,
    };

    const mockCreateImageDto: CreateImageDto = {
        image_url: 'https://images.kindly.org/causes/nueva_foto.jpg',
    };

    const validationPipe = new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    });

    beforeEach(async () => {
        imageRepository = {
            create: jest.fn<any>().mockImplementation((dto: any) => ({
                id: 1,
                ...dto,
            })),
            save: jest.fn<any>().mockImplementation((entity: any) =>
                Promise.resolve({
                    ...entity,
                    id: entity.id || 1,
                }),
            ),
            find: jest.fn<any>(),
            findOne: jest.fn<any>(),
            delete: jest.fn<any>().mockImplementation(() => Promise.resolve({ affected: 1, raw: [] })),
        };

        causeRepository = {
            findOne: jest.fn<any>(),
        };

        organizerRepository = {
            findOne: jest.fn<any>(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ImageService,
                {
                    provide: getRepositoryToken(Image),
                    useValue: imageRepository,
                },
                {
                    provide: getRepositoryToken(Cause),
                    useValue: causeRepository,
                },
                {
                    provide: getRepositoryToken(Organizer),
                    useValue: organizerRepository,
                },
            ],
        }).compile();

        service = module.get<ImageService>(ImageService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create (POST /causes/:causeId/images?organizer_id=:organizerId)', () => {
        it('1. should create an image successfully with owner organizer', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (causeRepository.findOne as any).mockResolvedValue(mockCause);

            const result = await service.create(1, 1, mockCreateImageDto);

            expect(result).toBeDefined();
            expect(result.cause_id).toBe(1);
            expect(result.image_url).toBe(mockCreateImageDto.image_url);
            expect(imageRepository.create).toHaveBeenCalledTimes(1);
            expect(imageRepository.save).toHaveBeenCalledTimes(1);
        });

        it('2. should fail if cause does not exist on create', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (causeRepository.findOne as any).mockResolvedValue(null);

            await expect(service.create(999, 1, mockCreateImageDto)).rejects.toThrow(CauseNotFoundException);
            expect(imageRepository.save).not.toHaveBeenCalled();
        });

        it('3. should fail if organizer does not exist on create', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(null);

            await expect(service.create(1, 999, mockCreateImageDto)).rejects.toThrow(OrganizerNotFoundException);
            expect(imageRepository.save).not.toHaveBeenCalled();
        });

        it('4. should fail with ForbiddenException if cause belongs to another organizer on create', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            const otherCause = { ...mockCause, organizer_id: 2 };
            (causeRepository.findOne as any).mockResolvedValue(otherCause);

            await expect(service.create(1, 1, mockCreateImageDto)).rejects.toThrow(ForbiddenException);
            expect(imageRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('findAllByCause (GET /causes/:causeId/images - public)', () => {
        it('5. should retrieve all images of a cause without requiring organizer_id', async () => {
            (causeRepository.findOne as any).mockResolvedValue(mockCause);
            (imageRepository.find as any).mockResolvedValue([mockImage]);

            const result = await service.findAllByCause(1);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(mockImage);
            expect(imageRepository.find).toHaveBeenCalledWith({
                where: { cause_id: 1 },
            });
        });

        it('6. should return [] when cause has no images', async () => {
            (causeRepository.findOne as any).mockResolvedValue(mockCause);
            (imageRepository.find as any).mockResolvedValue([]);

            const result = await service.findAllByCause(1);

            expect(result).toEqual([]);
        });

        it('7. should fail if cause does not exist on findAllByCause', async () => {
            (causeRepository.findOne as any).mockResolvedValue(null);

            await expect(service.findAllByCause(999)).rejects.toThrow(CauseNotFoundException);
            expect(imageRepository.find).not.toHaveBeenCalled();
        });
    });

    describe('remove (DELETE /causes/:causeId/images/:imageId?organizer_id=:organizerId)', () => {
        it('8. should remove an image successfully with owner organizer', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (causeRepository.findOne as any).mockResolvedValue(mockCause);
            (imageRepository.findOne as any).mockResolvedValue(mockImage);

            const result = await service.remove(1, 1, 1);

            expect(result).toBeDefined();
            expect(result.message).toContain("Image with identifier '1' removed successfully.");
            expect(imageRepository.delete).toHaveBeenCalledWith(1);
        });

        it('9. should fail if cause does not exist on remove', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (causeRepository.findOne as any).mockResolvedValue(null);

            await expect(service.remove(999, 1, 1)).rejects.toThrow(CauseNotFoundException);
            expect(imageRepository.delete).not.toHaveBeenCalled();
        });

        it('10. should fail if organizer does not exist on remove', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(null);

            await expect(service.remove(1, 1, 999)).rejects.toThrow(OrganizerNotFoundException);
            expect(imageRepository.delete).not.toHaveBeenCalled();
        });

        it('11. should fail if organizer is not owner on remove', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            const otherCause = { ...mockCause, organizer_id: 2 };
            (causeRepository.findOne as any).mockResolvedValue(otherCause);

            await expect(service.remove(1, 1, 1)).rejects.toThrow(ForbiddenException);
            expect(imageRepository.delete).not.toHaveBeenCalled();
        });

        it('12. should fail if image does not exist', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (causeRepository.findOne as any).mockResolvedValue(mockCause);
            (imageRepository.findOne as any).mockResolvedValue(null);

            await expect(service.remove(1, 999, 1)).rejects.toThrow(NotFoundException);
            expect(imageRepository.delete).not.toHaveBeenCalled();
        });

        it('13. should fail if image belongs to another cause', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (causeRepository.findOne as any).mockResolvedValue(mockCause);
            const foreignImage = { ...mockImage, cause_id: 2 };
            (imageRepository.findOne as any).mockResolvedValue(foreignImage);

            await expect(service.remove(1, 1, 1)).rejects.toThrow(BadRequestException);
            expect(imageRepository.delete).not.toHaveBeenCalled();
        });

        it('14. should fail if image belongs to an announcement (cause_id is null)', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (causeRepository.findOne as any).mockResolvedValue(mockCause);
            const announcementImage: Image = {
                id: 3,
                cause_id: null as any,
                announcement_id: 1,
                image_url: 'https://images.kindly.org/announcements/mapa.png',
                cause: null as any,
                announcement: {} as any,
            };
            (imageRepository.findOne as any).mockResolvedValue(announcementImage);

            await expect(service.remove(1, 3, 1)).rejects.toThrow(BadRequestException);
            expect(imageRepository.delete).not.toHaveBeenCalled();
        });
    });

    describe('Pipes and DTO Validations', () => {
        it('15. should throw BadRequestException for invalid organizer ID via PositiveIntPipe', () => {
            const pipe = new PositiveIntPipe();

            expect(() => pipe.transform('xyz', { type: 'query', data: 'organizer_id' })).toThrow(BadRequestException);
            expect(() => pipe.transform('-5', { type: 'query', data: 'organizer_id' })).toThrow(BadRequestException);
            expect(() => pipe.transform('0', { type: 'query', data: 'organizer_id' })).toThrow(BadRequestException);
        });

        it('16. should throw BadRequestException for missing organizer_id via PositiveIntPipe', () => {
            const pipe = new PositiveIntPipe();

            expect(() => pipe.transform(undefined as any, { type: 'query', data: 'organizer_id' })).toThrow(
                BadRequestException,
            );
        });

        it('17. should reject CreateImageDto when image_url is invalid URL or empty', async () => {
            const invalidDto = {
                image_url: 'not-a-valid-url',
            };

            await expect(
                validationPipe.transform(invalidDto, {
                    type: 'body',
                    metatype: CreateImageDto,
                }),
            ).rejects.toThrow(BadRequestException);

            const emptyDto = {
                image_url: '',
            };

            await expect(
                validationPipe.transform(emptyDto, {
                    type: 'body',
                    metatype: CreateImageDto,
                }),
            ).rejects.toThrow(BadRequestException);
        });

        it('18. should reject CreateImageDto when extra forbidden fields are sent', async () => {
            const extraFieldsDto = {
                image_url: 'https://example.com/foto.jpg',
                extra_field: 'forbidden',
            };

            await expect(
                validationPipe.transform(extraFieldsDto, {
                    type: 'body',
                    metatype: CreateImageDto,
                }),
            ).rejects.toThrow(BadRequestException);
        });
    });
});
