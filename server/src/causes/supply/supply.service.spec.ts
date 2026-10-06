import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { BadRequestException, ForbiddenException, NotFoundException, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupplyService } from './supply.service';
import { Supply } from '../entities/supply.entity';
import { Cause } from '../entities/cause.entity';
import { Organizer } from '../../organizations/entities/organizer.entity';
import { CreateSupplyDto } from './dto/create-supply.dto';
import { UpdateSupplyDto } from './dto/update-supply.dto';
import { CauseNotFoundException, OrganizerNotFoundException } from '../../common/exceptions';
import { PositiveIntPipe } from '../../common/pipes/positive-int.pipe';

describe('SupplyService', () => {
    let service: SupplyService;
    let supplyRepository: jest.Mocked<Partial<Repository<Supply>>>;
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

    const mockSupply: Supply = {
        id: 1,
        cause_id: 1,
        item_name: 'Guantes de jardinería reforzados',
        needed: true,
        quantity_needed: 50,
        image: 'https://images.kindly.org/supplies/guantes.jpg',
        cause: mockCause,
    };

    const mockCreateSupplyDto: CreateSupplyDto = {
        item_name: 'Palas pequeñas',
        quantity_needed: 20,
        image: 'https://images.kindly.org/supplies/palas.jpg',
        needed: true,
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
        supplyRepository = {
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
                SupplyService,
                {
                    provide: getRepositoryToken(Supply),
                    useValue: supplyRepository,
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

        service = module.get<SupplyService>(SupplyService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create (POST /causes/:causeId/supplies?organizer_id=:organizerId)', () => {
        it('1. should create a supply successfully with owner organizer', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (causeRepository.findOne as any).mockResolvedValue(mockCause);

            const result = await service.create(1, 1, mockCreateSupplyDto);

            expect(result).toBeDefined();
            expect(result.cause_id).toBe(1);
            expect(result.item_name).toBe(mockCreateSupplyDto.item_name);
            expect(result.quantity_needed).toBe(mockCreateSupplyDto.quantity_needed);
            expect(supplyRepository.create).toHaveBeenCalledTimes(1);
            expect(supplyRepository.save).toHaveBeenCalledTimes(1);
        });

        it('2. should fail if cause does not exist', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (causeRepository.findOne as any).mockResolvedValue(null);

            await expect(service.create(999, 1, mockCreateSupplyDto)).rejects.toThrow(CauseNotFoundException);
            expect(supplyRepository.save).not.toHaveBeenCalled();
        });

        it('3. should fail if organizer does not exist', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(null);

            await expect(service.create(1, 999, mockCreateSupplyDto)).rejects.toThrow(OrganizerNotFoundException);
            expect(supplyRepository.save).not.toHaveBeenCalled();
        });

        it('4. should fail with ForbiddenException if cause belongs to another organizer', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            const otherCause = { ...mockCause, organizer_id: 2 };
            (causeRepository.findOne as any).mockResolvedValue(otherCause);

            await expect(service.create(1, 1, mockCreateSupplyDto)).rejects.toThrow(ForbiddenException);
            expect(supplyRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('findAllByCause (GET /causes/:causeId/supplies - public)', () => {
        it('5. should retrieve all supplies of a cause without requiring organizer_id', async () => {
            (causeRepository.findOne as any).mockResolvedValue(mockCause);
            (supplyRepository.find as any).mockResolvedValue([mockSupply]);

            const result = await service.findAllByCause(1);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(mockSupply);
            expect(supplyRepository.find).toHaveBeenCalledWith({
                where: { cause_id: 1 },
            });
        });

        it('6. should return [] when no supplies exist', async () => {
            (causeRepository.findOne as any).mockResolvedValue(mockCause);
            (supplyRepository.find as any).mockResolvedValue([]);

            const result = await service.findAllByCause(1);

            expect(result).toEqual([]);
        });

        it('7. should fail if cause does not exist on findAllByCause', async () => {
            (causeRepository.findOne as any).mockResolvedValue(null);

            await expect(service.findAllByCause(999)).rejects.toThrow(CauseNotFoundException);
            expect(supplyRepository.find).not.toHaveBeenCalled();
        });
    });

    describe('update (PATCH /causes/:causeId/supplies/:supplyId?organizer_id=:organizerId)', () => {
        const updateDto: UpdateSupplyDto = {
            quantity_needed: 75,
            needed: false,
        };

        it('8. should update a supply successfully with owner organizer', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (causeRepository.findOne as any).mockResolvedValue(mockCause);
            (supplyRepository.findOne as any).mockResolvedValue({ ...mockSupply });

            const result = await service.update(1, 1, 1, updateDto);

            expect(result.quantity_needed).toBe(75);
            expect(result.needed).toBe(false);
            expect(supplyRepository.save).toHaveBeenCalledTimes(1);
        });

        it('9. should fail if organizer does not exist on update', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(null);

            await expect(service.update(1, 1, 999, updateDto)).rejects.toThrow(OrganizerNotFoundException);
            expect(supplyRepository.save).not.toHaveBeenCalled();
        });

        it('10. should fail if organizer is not owner on update', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            const otherCause = { ...mockCause, organizer_id: 2 };
            (causeRepository.findOne as any).mockResolvedValue(otherCause);

            await expect(service.update(1, 1, 1, updateDto)).rejects.toThrow(ForbiddenException);
            expect(supplyRepository.save).not.toHaveBeenCalled();
        });

        it('11. should fail if cause does not exist on update', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (causeRepository.findOne as any).mockResolvedValue(null);

            await expect(service.update(999, 1, 1, updateDto)).rejects.toThrow(CauseNotFoundException);
            expect(supplyRepository.findOne).not.toHaveBeenCalled();
        });

        it('12. should fail if supply does not exist', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (causeRepository.findOne as any).mockResolvedValue(mockCause);
            (supplyRepository.findOne as any).mockResolvedValue(null);

            await expect(service.update(1, 999, 1, updateDto)).rejects.toThrow(NotFoundException);
            expect(supplyRepository.save).not.toHaveBeenCalled();
        });

        it('13. should fail if supply belongs to another cause', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (causeRepository.findOne as any).mockResolvedValue(mockCause);
            const foreignSupply = { ...mockSupply, cause_id: 2 };
            (supplyRepository.findOne as any).mockResolvedValue(foreignSupply);

            await expect(service.update(1, 1, 1, updateDto)).rejects.toThrow(BadRequestException);
            expect(supplyRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('remove (DELETE /causes/:causeId/supplies/:supplyId?organizer_id=:organizerId)', () => {
        it('14. should remove a supply successfully with owner organizer', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (causeRepository.findOne as any).mockResolvedValue(mockCause);
            (supplyRepository.findOne as any).mockResolvedValue(mockSupply);

            const result = await service.remove(1, 1, 1);

            expect(result).toBeDefined();
            expect(result.message).toContain("Supply with identifier '1' removed successfully.");
            expect(supplyRepository.delete).toHaveBeenCalledWith(1);
        });

        it('15. should fail if organizer does not exist on remove', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(null);

            await expect(service.remove(1, 1, 999)).rejects.toThrow(OrganizerNotFoundException);
            expect(supplyRepository.delete).not.toHaveBeenCalled();
        });

        it('16. should fail if organizer is not owner on remove', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            const otherCause = { ...mockCause, organizer_id: 2 };
            (causeRepository.findOne as any).mockResolvedValue(otherCause);

            await expect(service.remove(1, 1, 1)).rejects.toThrow(ForbiddenException);
            expect(supplyRepository.delete).not.toHaveBeenCalled();
        });

        it('17. should fail if cause does not exist on remove', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (causeRepository.findOne as any).mockResolvedValue(null);

            await expect(service.remove(999, 1, 1)).rejects.toThrow(CauseNotFoundException);
            expect(supplyRepository.delete).not.toHaveBeenCalled();
        });

        it('18. should fail if supply does not exist on remove', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (causeRepository.findOne as any).mockResolvedValue(mockCause);
            (supplyRepository.findOne as any).mockResolvedValue(null);

            await expect(service.remove(1, 999, 1)).rejects.toThrow(NotFoundException);
            expect(supplyRepository.delete).not.toHaveBeenCalled();
        });

        it('19. should fail if supply belongs to another cause on remove', async () => {
            (organizerRepository.findOne as any).mockResolvedValue(mockOrganizer);
            (causeRepository.findOne as any).mockResolvedValue(mockCause);
            const foreignSupply = { ...mockSupply, cause_id: 2 };
            (supplyRepository.findOne as any).mockResolvedValue(foreignSupply);

            await expect(service.remove(1, 1, 1)).rejects.toThrow(BadRequestException);
            expect(supplyRepository.delete).not.toHaveBeenCalled();
        });
    });

    describe('Pipes and DTO Validations', () => {
        it('20. should throw BadRequestException for invalid organizer ID via PositiveIntPipe', () => {
            const pipe = new PositiveIntPipe();

            expect(() => pipe.transform('xyz', { type: 'query', data: 'organizer_id' })).toThrow(BadRequestException);
            expect(() => pipe.transform('-5', { type: 'query', data: 'organizer_id' })).toThrow(BadRequestException);
            expect(() => pipe.transform('0', { type: 'query', data: 'organizer_id' })).toThrow(BadRequestException);
        });

        it('21. should throw BadRequestException for missing organizer_id via PositiveIntPipe', () => {
            const pipe = new PositiveIntPipe();

            expect(() => pipe.transform(undefined as any, { type: 'query', data: 'organizer_id' })).toThrow(
                BadRequestException,
            );
        });

        it('22. should reject CreateSupplyDto when required fields are invalid', async () => {
            const invalidDto = {
                item_name: '',
                quantity_needed: -1,
                image: 'not-a-url',
            };

            await expect(
                validationPipe.transform(invalidDto, {
                    type: 'body',
                    metatype: CreateSupplyDto,
                }),
            ).rejects.toThrow(BadRequestException);
        });

        it('23. should reject CreateSupplyDto when extra forbidden fields are sent', async () => {
            const extraFieldsDto = {
                item_name: 'Pala',
                quantity_needed: 10,
                image: 'https://example.com/pala.jpg',
                extra_field: 'forbidden',
            };

            await expect(
                validationPipe.transform(extraFieldsDto, {
                    type: 'body',
                    metatype: CreateSupplyDto,
                }),
            ).rejects.toThrow(BadRequestException);
        });
    });
});
