import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CausesService } from './causes.service';
import { Cause } from './entities/cause.entity';
import { Organizer } from '../organizations/entities/organizer.entity';
import { Category } from '../volunteers/entities/category.entity';
import { CreateCauseDto } from './dto/create-cause.dto';
import { OrganizerNotFoundException, OrganizationNotVerifiedException } from '../common/exceptions';

describe('CausesService', () => {
    let service: CausesService;
    let causeRepository: jest.Mocked<Partial<Repository<Cause>>>;
    let organizerRepository: jest.Mocked<Partial<Repository<Organizer>>>;
    let categoryRepository: jest.Mocked<Partial<Repository<Category>>>;

    const mockValidDto: CreateCauseDto = {
        organizer_id: 1,
        category_id: 1,
        title: 'Siembra de Árboles en Reserva Natural',
        cover_image_url: 'https://images.kindly.org/causes/sembraton.jpg',
        description: 'Jornada comunitaria para sembrar 200 árboles nativos.',
        capacity: 30,
        start_date: '2026-11-01T08:00:00.000Z',
        end_date: '2026-11-01T14:00:00.000Z',
        address: 'Parque Natural, Vereda El Salado',
        location_latitude: '6.2442',
        location_longitude: '-75.5812',
    };

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

    const mockCategory: Category = {
        id: 1,
        name: 'Medio Ambiente y Reforestación',
        causes: [],
        volunteerCategories: [],
    };

    beforeEach(async () => {
        causeRepository = {
            create: jest.fn<any>().mockImplementation((dto: any) => ({
                id: 10,
                ...dto,
            })),
            save: jest.fn<any>().mockImplementation((cause: any) =>
                Promise.resolve({
                    ...cause,
                    id: cause.id || 10,
                }),
            ),
        };

        organizerRepository = {
            findOne: jest.fn<any>(),
        };

        categoryRepository = {
            findOne: jest.fn<any>(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CausesService,
                {
                    provide: getRepositoryToken(Cause),
                    useValue: causeRepository,
                },
                {
                    provide: getRepositoryToken(Organizer),
                    useValue: organizerRepository,
                },
                {
                    provide: getRepositoryToken(Category),
                    useValue: categoryRepository,
                },
            ],
        }).compile();

        service = module.get<CausesService>(CausesService);
    });

    it('debe estar definido el servicio', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('1. crea una causa correctamente', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (categoryRepository.findOne as any).mockResolvedValue(mockCategory);

            const result = await service.create(mockValidDto);

            expect(result).toBeDefined();
            expect(result.id).toBe(10);
            expect(result.title).toBe(mockValidDto.title);
            expect(result.organizer).toEqual(mockOrganizer);
            expect(result.category).toEqual(mockCategory);
        });

        it('2. lanza OrganizerNotFoundException si el organizer no existe', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(null);

            await expect(service.create(mockValidDto)).rejects.toThrow(OrganizerNotFoundException);
            expect(causeRepository.save).not.toHaveBeenCalled();
        });

        it('3. lanza OrganizationNotVerifiedException si el organizer no está verificado', async () => {
            const unverifiedOrganizer = {
                ...mockOrganizer,
                verification_status: 'pending',
            };
            (organizerRepository.findOne as any).mockResolvedValue(unverifiedOrganizer);

            await expect(service.create(mockValidDto)).rejects.toThrow(OrganizationNotVerifiedException);
            expect(causeRepository.save).not.toHaveBeenCalled();
        });

        it('4. maneja categoría inexistente lanzando NotFoundException', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (categoryRepository.findOne as any).mockResolvedValue(null);

            await expect(service.create(mockValidDto)).rejects.toThrow(NotFoundException);
            expect(causeRepository.save).not.toHaveBeenCalled();
        });

        it('5. guarda correctamente la causa mediante el repository', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (categoryRepository.findOne as any).mockResolvedValue(mockCategory);

            await service.create(mockValidDto);

            expect(causeRepository.create).toHaveBeenCalledTimes(1);
            expect(causeRepository.save).toHaveBeenCalledTimes(1);
        });

        it('6. establece correctamente los valores iniciales (is_available = true, progress = "open")', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (categoryRepository.findOne as any).mockResolvedValue(mockCategory);

            const result = await service.create(mockValidDto);

            expect(result.is_available).toBe(true);
            expect(result.progress).toBe('open');
            expect(result.qr_code).toBeDefined();
            expect(result.qr_code.startsWith('QR-CAUSE-')).toBe(true);
        });

        it('7. lanza BadRequestException si end_date es anterior a start_date', async () => {
            const invalidDatesDto: CreateCauseDto = {
                ...mockValidDto,
                start_date: '2026-11-05T10:00:00.000Z',
                end_date: '2026-11-01T10:00:00.000Z',
            };

            await expect(service.create(invalidDatesDto)).rejects.toThrow(BadRequestException);
            expect(organizerRepository.findOne).not.toHaveBeenCalled();
            expect(causeRepository.save).not.toHaveBeenCalled();
        });
    });
});
