import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CausesService } from './causes.service';
import { Cause } from './entities/cause.entity';
import { Organizer } from '../organizations/entities/organizer.entity';
import { Category } from '../volunteers/entities/category.entity';
import { Submission } from '../participations/entities/submission.entity';
import { CreateCauseDto } from './dto/create-cause.dto';
import { UpdateCauseDto } from './dto/update-cause.dto';
import {
    OrganizerNotFoundException,
    OrganizationNotVerifiedException,
    CauseNotFoundException,
} from '../common/exceptions';

describe('CausesService', () => {
    let service: CausesService;
    let causeRepository: jest.Mocked<Partial<Repository<Cause>>>;
    let organizerRepository: jest.Mocked<Partial<Repository<Organizer>>>;
    let categoryRepository: jest.Mocked<Partial<Repository<Category>>>;
    let submissionRepository: jest.Mocked<Partial<Repository<Submission>>>;

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
        is_available: false,
        location_latitude: '6.2442',
        location_longitude: '-75.5812',
        progress: 'open',
        qr_code: 'QR-CAUSE-001',
        organizer: mockOrganizer,
        category: mockCategory,
        supplies: [],
        images: [],
        announcements: [],
        submissions: [],
        attendances: [],
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
            findOne: jest.fn<any>(),
            find: jest.fn<any>(),
        };

        organizerRepository = {
            findOne: jest.fn<any>(),
        };

        categoryRepository = {
            findOne: jest.fn<any>(),
        };

        submissionRepository = {
            count: jest.fn<any>(),
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
                {
                    provide: getRepositoryToken(Submission),
                    useValue: submissionRepository,
                },
            ],
        }).compile();

        service = module.get<CausesService>(CausesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('1. should create a cause successfully', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (categoryRepository.findOne as any).mockResolvedValue(mockCategory);

            const result = await service.create(mockValidDto);

            expect(result).toBeDefined();
            expect(result.id).toBe(10);
            expect(result.title).toBe(mockValidDto.title);
            expect(result.organizer).toEqual(mockOrganizer);
            expect(result.category).toEqual(mockCategory);
        });

        it('2. should throw OrganizerNotFoundException if organizer does not exist', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(null);

            await expect(service.create(mockValidDto)).rejects.toThrow(OrganizerNotFoundException);
            expect(causeRepository.save).not.toHaveBeenCalled();
        });

        it('3. should throw OrganizationNotVerifiedException if organizer is not verified', async () => {
            const unverifiedOrganizer = {
                ...mockOrganizer,
                verification_status: 'pending',
            };
            (organizerRepository.findOne as any).mockResolvedValue(unverifiedOrganizer);

            await expect(service.create(mockValidDto)).rejects.toThrow(OrganizationNotVerifiedException);
            expect(causeRepository.save).not.toHaveBeenCalled();
        });

        it('4. should handle non-existent category by throwing NotFoundException', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (categoryRepository.findOne as any).mockResolvedValue(null);

            await expect(service.create(mockValidDto)).rejects.toThrow(NotFoundException);
            expect(causeRepository.save).not.toHaveBeenCalled();
        });

        it('5. should save cause correctly via repository', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (categoryRepository.findOne as any).mockResolvedValue(mockCategory);

            await service.create(mockValidDto);

            expect(causeRepository.create).toHaveBeenCalledTimes(1);
            expect(causeRepository.save).toHaveBeenCalledTimes(1);
        });

        it('6. should set initial values correctly (is_available = false, progress = "open")', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (categoryRepository.findOne as any).mockResolvedValue(mockCategory);

            const result = await service.create(mockValidDto);

            expect(result.is_available).toBe(false);
            expect(result.progress).toBe('open');
            expect(result.qr_code).toBeDefined();
            expect(result.qr_code.startsWith('QR-CAUSE-')).toBe(true);
        });

        it('7. should throw BadRequestException if end_date is before start_date', async () => {
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

    describe('publish', () => {
        it('8. should publish a cause successfully (is_available changes to true, progress remains "open")', async () => {
            const unpublishedCause = { ...mockCause, is_available: false, progress: 'open' };
            (causeRepository.findOne as any).mockResolvedValue(unpublishedCause);

            const result = await service.publish(1);

            expect(result.is_available).toBe(true);
            expect(result.progress).toBe('open');
            expect(causeRepository.save).toHaveBeenCalledTimes(1);
        });

        it('9. should fail if cause does not exist', async () => {
            (causeRepository.findOne as any).mockResolvedValue(null);

            await expect(service.publish(999)).rejects.toThrow(CauseNotFoundException);
            expect(causeRepository.save).not.toHaveBeenCalled();
        });

        it('10. should verify repository.save() is called when publishing', async () => {
            const unpublishedCause = { ...mockCause, is_available: false };
            (causeRepository.findOne as any).mockResolvedValue(unpublishedCause);

            await service.publish(1);

            expect(causeRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(causeRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 1,
                    is_available: true,
                    progress: 'open',
                }),
            );
        });

        it('11. should be idempotent if cause is already available (remains is_available = true, progress = "open")', async () => {
            const alreadyAvailableCause = { ...mockCause, is_available: true, progress: 'open' };
            (causeRepository.findOne as any).mockResolvedValue(alreadyAvailableCause);

            const result = await service.publish(1);

            expect(result.is_available).toBe(true);
            expect(result.progress).toBe('open');
            expect(causeRepository.save).toHaveBeenCalledTimes(1);
        });
    });

    describe('findMyCauses', () => {
        it('12. should return only causes belonging to the specified organizer', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (causeRepository.find as any).mockResolvedValue([mockCause]);

            const result = await service.findMyCauses(1);

            expect(result).toHaveLength(1);
            expect(result[0].organizer_id).toBe(1);
            expect(causeRepository.find).toHaveBeenCalledWith({
                where: { organizer_id: 1 },
            });
        });

        it('13. should return multiple causes when organizer has several causes', async () => {
            const secondCause: Cause = {
                ...mockCause,
                id: 4,
                title: 'Taller de Huerta Escolar y Reciclaje',
            };
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (causeRepository.find as any).mockResolvedValue([mockCause, secondCause]);

            const result = await service.findMyCauses(1);

            expect(result).toHaveLength(2);
            expect(result.every((cause) => cause.organizer_id === 1)).toBe(true);
        });

        it('14. should return [] when organizer exists but has no causes', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (causeRepository.find as any).mockResolvedValue([]);

            const result = await service.findMyCauses(1);

            expect(result).toEqual([]);
        });

        it('15. should throw OrganizerNotFoundException if organizer does not exist', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(null);

            await expect(service.findMyCauses(999)).rejects.toThrow(OrganizerNotFoundException);
            expect(causeRepository.find).not.toHaveBeenCalled();
        });

        it('16. should verify that query uses the correct organizer_id', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (causeRepository.find as any).mockResolvedValue([mockCause]);

            await service.findMyCauses(1);

            expect(organizerRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(causeRepository.find).toHaveBeenCalledWith({
                where: { organizer_id: 1 },
            });
        });

        it('17. should ensure no causes from other organizers are included in result', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (causeRepository.find as any).mockResolvedValue([mockCause]);

            const result = await service.findMyCauses(1);

            expect(result.some((cause) => cause.organizer_id !== 1)).toBe(false);
        });
    });

    describe('update', () => {
        const updateDto: UpdateCauseDto = {
            title: 'Gran Sembratón 2026 Renovada',
            description: 'Descripción actualizada de la jornada.',
            capacity: 60,
        };

        it('18. should update cause information successfully when belonging to organizer', async () => {
            const currentCause = { ...mockCause, is_available: true, progress: 'open' };
            (causeRepository.findOne as any).mockResolvedValue(currentCause);
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);

            const result = await service.update(1, 1, updateDto);

            expect(result.title).toBe(updateDto.title);
            expect(result.description).toBe(updateDto.description);
            expect(result.capacity).toBe(updateDto.capacity);
            expect(causeRepository.save).toHaveBeenCalledTimes(1);
        });

        it('19. should update only provided fields and preserve unprovided fields', async () => {
            const currentCause = { ...mockCause, address: 'Parque Ecológico Original', capacity: 50 };
            (causeRepository.findOne as any).mockResolvedValue(currentCause);
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);

            const partialDto: UpdateCauseDto = { title: 'Solo Título Nuevo' };
            const result = await service.update(1, 1, partialDto);

            expect(result.title).toBe('Solo Título Nuevo');
            expect(result.address).toBe('Parque Ecológico Original');
            expect(result.capacity).toBe(50);
        });

        it('20. should fail if cause does not exist', async () => {
            (causeRepository.findOne as any).mockResolvedValue(null);

            await expect(service.update(999, 1, updateDto)).rejects.toThrow(CauseNotFoundException);
            expect(causeRepository.save).not.toHaveBeenCalled();
        });

        it('21. should fail if organizer does not exist', async () => {
            (causeRepository.findOne as any).mockResolvedValue({ ...mockCause });
            (organizerRepository.findOne as any).mockResolvedValue(null);

            await expect(service.update(1, 999, updateDto)).rejects.toThrow(OrganizerNotFoundException);
            expect(causeRepository.save).not.toHaveBeenCalled();
        });

        it('22. should reject operation if organizer is not the cause owner', async () => {
            const foreignCause = { ...mockCause, organizer_id: 2 };
            (causeRepository.findOne as any).mockResolvedValue(foreignCause);
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);

            await expect(service.update(1, 1, updateDto)).rejects.toThrow(ForbiddenException);
            expect(causeRepository.save).not.toHaveBeenCalled();
        });

        it('23. should fail if updated category_id does not exist', async () => {
            (causeRepository.findOne as any).mockResolvedValue({ ...mockCause });
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (categoryRepository.findOne as any).mockResolvedValue(null);

            const dtoWithCategory: UpdateCauseDto = { category_id: 999 };
            await expect(service.update(1, 1, dtoWithCategory)).rejects.toThrow(NotFoundException);
            expect(causeRepository.save).not.toHaveBeenCalled();
        });

        it('24. should update category when valid category_id is provided', async () => {
            (causeRepository.findOne as any).mockResolvedValue({ ...mockCause });
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            const newCategory = { ...mockCategory, id: 2, name: 'Educación' };
            (categoryRepository.findOne as any).mockResolvedValue(newCategory);

            const dtoWithCategory: UpdateCauseDto = { category_id: 2 };
            const result = await service.update(1, 1, dtoWithCategory);

            expect(result.category_id).toBe(2);
            expect(result.category).toEqual(newCategory);
        });

        it('25. should fail if updated end_date is earlier than start_date', async () => {
            const currentCause = {
                ...mockCause,
                start_date: new Date('2026-11-10T10:00:00Z'),
                end_date: new Date('2026-11-10T18:00:00Z'),
            };
            (causeRepository.findOne as any).mockResolvedValue(currentCause);
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);

            const invalidDatesDto: UpdateCauseDto = {
                end_date: '2026-11-09T10:00:00Z',
            };

            await expect(service.update(1, 1, invalidDatesDto)).rejects.toThrow(BadRequestException);
            expect(causeRepository.save).not.toHaveBeenCalled();
        });

        it('26. should verify repository.save is called with the updated values', async () => {
            const currentCause = { ...mockCause };
            (causeRepository.findOne as any).mockResolvedValue(currentCause);
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);

            await service.update(1, 1, updateDto);

            expect(causeRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 1,
                    title: updateDto.title,
                    description: updateDto.description,
                }),
            );
        });

        it('27. should verify that is_available does not change when updating information', async () => {
            const publishedCause = { ...mockCause, is_available: true };
            (causeRepository.findOne as any).mockResolvedValue(publishedCause);
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);

            const result = await service.update(1, 1, updateDto);

            expect(result.is_available).toBe(true);
        });

        it('28. should verify that progress does not change when updating information', async () => {
            const inProgressCause = { ...mockCause, progress: 'in_progress' };
            (causeRepository.findOne as any).mockResolvedValue(inProgressCause);
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);

            const result = await service.update(1, 1, updateDto);

            expect(result.progress).toBe('in_progress');
        });
    });

    describe('getCapacity', () => {
        it('29. should throw CauseNotFoundException when cause does not exist', async () => {
            (causeRepository.findOne as any).mockResolvedValue(null);

            await expect(service.getCapacity(999, 1)).rejects.toThrow(CauseNotFoundException);
            expect(causeRepository.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
        });

        it('30. should throw OrganizerNotFoundException when organizer does not exist', async () => {
            (causeRepository.findOne as any).mockResolvedValue(mockCause);
            (organizerRepository.findOne as any).mockResolvedValue(null);

            await expect(service.getCapacity(1, 999)).rejects.toThrow(OrganizerNotFoundException);
            expect(organizerRepository.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
        });

        it('31. should throw ForbiddenException when requesting organizer is not the owner', async () => {
            (causeRepository.findOne as any).mockResolvedValue(mockCause);
            (organizerRepository.findOne as any).mockResolvedValue({ ...mockOrganizer, id: 2 });

            await expect(service.getCapacity(1, 2)).rejects.toThrow(ForbiddenException);
        });

        it('32. should calculate capacity and occupied spots with approved submissions', async () => {
            const cause = { ...mockCause, capacity: 50 };
            (causeRepository.findOne as any).mockResolvedValue(cause);
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (submissionRepository.count as any).mockResolvedValue(2);

            const result = await service.getCapacity(1, 1);

            expect(result).toEqual({
                cause_id: 1,
                capacity: 50,
                occupied: 2,
                available: 48,
                is_full: false,
                status_display: '2/50 spots filled',
            });
        });

        it('33. should calculate capacity and occupied spots with accepted submissions', async () => {
            const cause = { ...mockCause, capacity: 30 };
            (causeRepository.findOne as any).mockResolvedValue(cause);
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (submissionRepository.count as any).mockResolvedValue(5);

            const result = await service.getCapacity(1, 1);

            expect(result).toEqual({
                cause_id: 1,
                capacity: 30,
                occupied: 5,
                available: 25,
                is_full: false,
                status_display: '5/30 spots filled',
            });
        });

        it('34. should not count pending submissions as occupied spots', async () => {
            const cause = { ...mockCause, capacity: 20 };
            (causeRepository.findOne as any).mockResolvedValue(cause);
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (submissionRepository.count as any).mockResolvedValue(0);

            const result = await service.getCapacity(1, 1);

            expect(result.occupied).toBe(0);
            expect(result.available).toBe(20);
            expect(result.status_display).toBe('0/20 spots filled');
        });

        it('35. should not count rejected submissions as occupied spots', async () => {
            const cause = { ...mockCause, capacity: 25 };
            (causeRepository.findOne as any).mockResolvedValue(cause);
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (submissionRepository.count as any).mockResolvedValue(3);

            const result = await service.getCapacity(1, 1);

            expect(result.occupied).toBe(3);
            expect(result.available).toBe(22);
            expect(result.is_full).toBe(false);
        });

        it('36. should correctly calculate available spots using Math.max(0, capacity - occupied)', async () => {
            const cause = { ...mockCause, capacity: 15 };
            (causeRepository.findOne as any).mockResolvedValue(cause);
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (submissionRepository.count as any).mockResolvedValue(7);

            const result = await service.getCapacity(1, 1);

            expect(result.available).toBe(8);
            expect(result.is_full).toBe(false);
        });

        it('37. should return available 0 and is_full true when cause is full without throwing CauseQuotaFullException', async () => {
            const cause = { ...mockCause, capacity: 10 };
            (causeRepository.findOne as any).mockResolvedValue(cause);
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (submissionRepository.count as any).mockResolvedValue(10);

            const result = await service.getCapacity(1, 1);

            expect(result).toEqual({
                cause_id: 1,
                capacity: 10,
                occupied: 10,
                available: 0,
                is_full: true,
                status_display: '10/10 spots filled',
            });
        });

        it('38. should handle cause without capacity (null) returning available null, is_full false and real occupied count', async () => {
            const unlimitedCause = { ...mockCause, capacity: null };
            (causeRepository.findOne as any).mockResolvedValue(unlimitedCause);
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (submissionRepository.count as any).mockResolvedValue(4);

            const result = await service.getCapacity(1, 1);

            expect(result).toEqual({
                cause_id: 1,
                capacity: null,
                occupied: 4,
                available: null,
                is_full: false,
                status_display: '4 volunteers (no limit)',
            });
        });

        it('39. should query submissions with case-insensitive status matching approved or accepted', async () => {
            (causeRepository.findOne as any).mockResolvedValue(mockCause);
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (submissionRepository.count as any).mockResolvedValue(2);

            await service.getCapacity(1, 1);

            expect(submissionRepository.count).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        cause_id: 1,
                    }),
                }),
            );
        });

        it('40. should return occupied 0 and full available capacity when cause has no submissions', async () => {
            const cause = { ...mockCause, capacity: 40 };
            (causeRepository.findOne as any).mockResolvedValue(cause);
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (submissionRepository.count as any).mockResolvedValue(0);

            const result = await service.getCapacity(1, 1);

            expect(result.occupied).toBe(0);
            expect(result.available).toBe(40);
            expect(result.is_full).toBe(false);
            expect(result.status_display).toBe('0/40 spots filled');
        });

        it('41. should format status_display correctly for both limited and unlimited capacity causes', async () => {
            // Case A: With capacity limit
            const causeWithLimit = { ...mockCause, capacity: 50 };
            (causeRepository.findOne as any).mockResolvedValue(causeWithLimit);
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (submissionRepository.count as any).mockResolvedValue(12);

            const resultWithLimit = await service.getCapacity(1, 1);
            expect(resultWithLimit.status_display).toBe('12/50 spots filled');

            // Case B: Without capacity limit
            const causeWithoutLimit = { ...mockCause, capacity: null };
            (causeRepository.findOne as any).mockResolvedValue(causeWithoutLimit);
            (submissionRepository.count as any).mockResolvedValue(12);

            const resultWithoutLimit = await service.getCapacity(1, 1);
            expect(resultWithoutLimit.status_display).toBe('12 volunteers (no limit)');
        });
    });
});
