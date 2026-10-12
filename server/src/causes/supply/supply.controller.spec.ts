jest.mock('@nestjs/mapped-types', () => ({
    PartialType: (classRef: unknown) => classRef,
    OmitType: (classRef: unknown) => classRef,
    PickType: (classRef: unknown) => classRef,
    IntersectionType: (...classRefs: unknown[]) => classRefs[0],
}));

import { SupplyController } from './supply.controller';
import { SupplyService } from './supply.service';
import { CreateSupplyDto } from './dto/create-supply.dto';
import { UpdateSupplyDto } from './dto/update-supply.dto';
import { Supply } from '../entities/supply.entity';

describe('SupplyController', () => {
    let controller: SupplyController;
    let supplyService: jest.Mocked<SupplyService>;

    const mockSupply: Supply = {
        id: 1,
        cause_id: 2,
        item_name: 'Palas',
        quantity_needed: 10,
        image: 'https://img.jpg',
        needed: true,
        created_at: new Date(),
        updated_at: new Date(),
    } as unknown as Supply;

    beforeEach(() => {
        supplyService = {
            create: jest.fn(),
            findAllByCause: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
        } as unknown as jest.Mocked<SupplyService>;

        controller = new SupplyController(supplyService);
    });

    describe('create', () => {
        it('should create supply item for cause and organizer', async () => {
            const dto: CreateSupplyDto = { item_name: 'Palas', quantity_needed: 10, image: 'https://img.jpg' };
            supplyService.create.mockResolvedValue(mockSupply);

            const result = await controller.create(2, 1, dto);

            expect(result).toEqual(mockSupply);
            expect(supplyService.create).toHaveBeenCalledWith(2, 1, dto);
        });
    });

    describe('findAll', () => {
        it('should return all supplies for cause', async () => {
            supplyService.findAllByCause.mockResolvedValue([mockSupply]);

            const result = await controller.findAll(2);

            expect(result).toEqual([mockSupply]);
            expect(supplyService.findAllByCause).toHaveBeenCalledWith(2);
        });
    });

    describe('update', () => {
        it('should update supply item', async () => {
            const dto: UpdateSupplyDto = { quantity_needed: 15 };
            supplyService.update.mockResolvedValue({ ...mockSupply, quantity_needed: 15 });

            const result = await controller.update(2, 1, 1, dto);

            expect(result.quantity_needed).toBe(15);
            expect(supplyService.update).toHaveBeenCalledWith(2, 1, 1, dto);
        });
    });

    describe('remove', () => {
        it('should remove supply item', async () => {
            supplyService.remove.mockResolvedValue({ message: 'Supply deleted successfully' });

            const result = await controller.remove(2, 1, 1);

            expect(result).toEqual({ message: 'Supply deleted successfully' });
            expect(supplyService.remove).toHaveBeenCalledWith(2, 1, 1);
        });
    });
});
