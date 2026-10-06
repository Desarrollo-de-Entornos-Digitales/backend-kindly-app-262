import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImageService } from './image.service';
import { Image } from '../entities/image.entity';
import { Cause } from '../../causes/entities/cause.entity';
import { CreateImageDto } from './dto/create-image.dto';
import { CauseNotFoundException } from '../../common/exceptions';

describe('ImageService', () => {
    let service: ImageService;
    let imageRepository: jest.Mocked<Partial<Repository<Image>>>;
    let causeRepository: jest.Mocked<Partial<Repository<Cause>>>;

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
        organizer: {} as any,
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
            ],
        }).compile();

        service = module.get<ImageService>(ImageService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('1. should create an image successfully', async () => {
            (causeRepository.findOne as any).mockResolvedValue(mockCause);

            const result = await service.create(1, mockCreateImageDto);

            expect(result).toBeDefined();
            expect(result.cause_id).toBe(1);
            expect(result.image_url).toBe(mockCreateImageDto.image_url);
        });

        it('2. should fail if cause does not exist', async () => {
            (causeRepository.findOne as any).mockResolvedValue(null);

            await expect(service.create(999, mockCreateImageDto)).rejects.toThrow(CauseNotFoundException);
            expect(imageRepository.save).not.toHaveBeenCalled();
        });

        it('3. should verify repository.save() is called', async () => {
            (causeRepository.findOne as any).mockResolvedValue(mockCause);

            await service.create(1, mockCreateImageDto);

            expect(imageRepository.create).toHaveBeenCalledTimes(1);
            expect(imageRepository.save).toHaveBeenCalledTimes(1);
        });
    });

    describe('findAllByCause', () => {
        it('4. should retrieve all images of a cause', async () => {
            (causeRepository.findOne as any).mockResolvedValue(mockCause);
            (imageRepository.find as any).mockResolvedValue([mockImage]);

            const result = await service.findAllByCause(1);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(mockImage);
            expect(imageRepository.find).toHaveBeenCalledWith({
                where: { cause_id: 1 },
            });
        });

        it('5. should return [] when cause has no images', async () => {
            (causeRepository.findOne as any).mockResolvedValue(mockCause);
            (imageRepository.find as any).mockResolvedValue([]);

            const result = await service.findAllByCause(1);

            expect(result).toEqual([]);
        });

        it('6. should fail if cause does not exist', async () => {
            (causeRepository.findOne as any).mockResolvedValue(null);

            await expect(service.findAllByCause(999)).rejects.toThrow(CauseNotFoundException);
            expect(imageRepository.find).not.toHaveBeenCalled();
        });
    });

    describe('remove', () => {
        it('7. should remove an image successfully', async () => {
            (causeRepository.findOne as any).mockResolvedValue(mockCause);
            (imageRepository.findOne as any).mockResolvedValue(mockImage);

            const result = await service.remove(1, 1);

            expect(result).toBeDefined();
            expect(result.message).toContain("Image with identifier '1' removed successfully.");
            expect(imageRepository.delete).toHaveBeenCalledWith(1);
        });

        it('8. should fail if cause does not exist', async () => {
            (causeRepository.findOne as any).mockResolvedValue(null);

            await expect(service.remove(999, 1)).rejects.toThrow(CauseNotFoundException);
            expect(imageRepository.delete).not.toHaveBeenCalled();
        });

        it('9. should fail if image does not exist', async () => {
            (causeRepository.findOne as any).mockResolvedValue(mockCause);
            (imageRepository.findOne as any).mockResolvedValue(null);

            await expect(service.remove(1, 999)).rejects.toThrow(NotFoundException);
            expect(imageRepository.delete).not.toHaveBeenCalled();
        });

        it('10. should fail if image belongs to another cause', async () => {
            (causeRepository.findOne as any).mockResolvedValue(mockCause);
            const foreignImage = { ...mockImage, cause_id: 2 };
            (imageRepository.findOne as any).mockResolvedValue(foreignImage);

            await expect(service.remove(1, 1)).rejects.toThrow(BadRequestException);
            expect(imageRepository.delete).not.toHaveBeenCalled();
        });

        it('11. should verify repository.delete() is called', async () => {
            (causeRepository.findOne as any).mockResolvedValue(mockCause);
            (imageRepository.findOne as any).mockResolvedValue(mockImage);

            await service.remove(1, 1);

            expect(imageRepository.delete).toHaveBeenCalledTimes(1);
            expect(imageRepository.delete).toHaveBeenCalledWith(1);
        });

        it('12. should fail if image belongs to an announcement (cause_id is null)', async () => {
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

            await expect(service.remove(1, 3)).rejects.toThrow(BadRequestException);
            expect(imageRepository.delete).not.toHaveBeenCalled();
        });
    });
});
