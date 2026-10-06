import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupplyService } from './supply.service';
import { Supply } from '../entities/supply.entity';
import { Cause } from '../entities/cause.entity';
import { CreateSupplyDto } from './dto/create-supply.dto';
import { UpdateSupplyDto } from './dto/update-supply.dto';
import { CauseNotFoundException } from '../../common/exceptions';

describe('SupplyService', () => {
    let service: SupplyService;
    let supplyRepository: jest.Mocked<Partial<Repository<Supply>>>;
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
            ],
        }).compile();

        service = module.get<SupplyService>(SupplyService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('1. should create a supply successfully', async () => {
            (causeRepository.findOne as any).mockResolvedValue(mockCause);

            const result = await service.create(1, mockCreateSupplyDto);

            expect(result).toBeDefined();
            expect(result.cause_id).toBe(1);
            expect(result.item_name).toBe(mockCreateSupplyDto.item_name);
            expect(result.quantity_needed).toBe(mockCreateSupplyDto.quantity_needed);
        });

        it('2. should fail if cause does not exist', async () => {
            (causeRepository.findOne as any).mockResolvedValue(null);

            await expect(service.create(999, mockCreateSupplyDto)).rejects.toThrow(CauseNotFoundException);
            expect(supplyRepository.save).not.toHaveBeenCalled();
        });

        it('3. should verify that repository.save() is called', async () => {
            (causeRepository.findOne as any).mockResolvedValue(mockCause);

            await service.create(1, mockCreateSupplyDto);

            expect(supplyRepository.create).toHaveBeenCalledTimes(1);
            expect(supplyRepository.save).toHaveBeenCalledTimes(1);
        });
    });

    describe('findAllByCause', () => {
        it('4. should retrieve all supplies of a cause', async () => {
            (causeRepository.findOne as any).mockResolvedValue(mockCause);
            (supplyRepository.find as any).mockResolvedValue([mockSupply]);

            const result = await service.findAllByCause(1);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(mockSupply);
            expect(supplyRepository.find).toHaveBeenCalledWith({
                where: { cause_id: 1 },
            });
        });

        it('5. should return [] when no supplies exist', async () => {
            (causeRepository.findOne as any).mockResolvedValue(mockCause);
            (supplyRepository.find as any).mockResolvedValue([]);

            const result = await service.findAllByCause(1);

            expect(result).toEqual([]);
        });

        it('6. should fail if cause does not exist', async () => {
            (causeRepository.findOne as any).mockResolvedValue(null);

            await expect(service.findAllByCause(999)).rejects.toThrow(CauseNotFoundException);
            expect(supplyRepository.find).not.toHaveBeenCalled();
        });
    });

    describe('update', () => {
        const updateDto: UpdateSupplyDto = {
            quantity_needed: 75,
            needed: false,
        };

        it('7. should update a supply successfully', async () => {
            (causeRepository.findOne as any).mockResolvedValue(mockCause);
            (supplyRepository.findOne as any).mockResolvedValue({ ...mockSupply });

            const result = await service.update(1, 1, updateDto);

            expect(result.quantity_needed).toBe(75);
            expect(result.needed).toBe(false);
            expect(supplyRepository.save).toHaveBeenCalledTimes(1);
        });

        it('8. should fail if cause does not exist', async () => {
            (causeRepository.findOne as any).mockResolvedValue(null);

            await expect(service.update(999, 1, updateDto)).rejects.toThrow(CauseNotFoundException);
            expect(supplyRepository.findOne).not.toHaveBeenCalled();
        });

        it('9. should fail if supply does not exist', async () => {
            (causeRepository.findOne as any).mockResolvedValue(mockCause);
            (supplyRepository.findOne as any).mockResolvedValue(null);

            await expect(service.update(1, 999, updateDto)).rejects.toThrow(NotFoundException);
            expect(supplyRepository.save).not.toHaveBeenCalled();
        });

        it('10. should fail if supply belongs to another cause', async () => {
            (causeRepository.findOne as any).mockResolvedValue(mockCause);
            const foreignSupply = { ...mockSupply, cause_id: 2 };
            (supplyRepository.findOne as any).mockResolvedValue(foreignSupply);

            await expect(service.update(1, 1, updateDto)).rejects.toThrow(BadRequestException);
            expect(supplyRepository.save).not.toHaveBeenCalled();
        });

        it('11. should verify repository.save() is called on update', async () => {
            (causeRepository.findOne as any).mockResolvedValue(mockCause);
            (supplyRepository.findOne as any).mockResolvedValue({ ...mockSupply });

            await service.update(1, 1, updateDto);

            expect(supplyRepository.save).toHaveBeenCalledTimes(1);
        });
    });

    describe('remove', () => {
        it('12. should remove a supply successfully', async () => {
            (causeRepository.findOne as any).mockResolvedValue(mockCause);
            (supplyRepository.findOne as any).mockResolvedValue(mockSupply);

            const result = await service.remove(1, 1);

            expect(result).toBeDefined();
            expect(result.message).toContain("Supply with identifier '1' removed successfully.");
            expect(supplyRepository.delete).toHaveBeenCalledWith(1);
        });

        it('13. should fail if cause does not exist', async () => {
            (causeRepository.findOne as any).mockResolvedValue(null);

            await expect(service.remove(999, 1)).rejects.toThrow(CauseNotFoundException);
            expect(supplyRepository.delete).not.toHaveBeenCalled();
        });

        it('14. should fail if supply does not exist', async () => {
            (causeRepository.findOne as any).mockResolvedValue(mockCause);
            (supplyRepository.findOne as any).mockResolvedValue(null);

            await expect(service.remove(1, 999)).rejects.toThrow(NotFoundException);
            expect(supplyRepository.delete).not.toHaveBeenCalled();
        });

        it('15. should fail if supply belongs to another cause', async () => {
            (causeRepository.findOne as any).mockResolvedValue(mockCause);
            const foreignSupply = { ...mockSupply, cause_id: 2 };
            (supplyRepository.findOne as any).mockResolvedValue(foreignSupply);

            await expect(service.remove(1, 1)).rejects.toThrow(BadRequestException);
            expect(supplyRepository.delete).not.toHaveBeenCalled();
        });

        it('16. should verify repository.delete() is called', async () => {
            (causeRepository.findOne as any).mockResolvedValue(mockCause);
            (supplyRepository.findOne as any).mockResolvedValue(mockSupply);

            await service.remove(1, 1);

            expect(supplyRepository.delete).toHaveBeenCalledTimes(1);
            expect(supplyRepository.delete).toHaveBeenCalledWith(1);
        });
    });
});
