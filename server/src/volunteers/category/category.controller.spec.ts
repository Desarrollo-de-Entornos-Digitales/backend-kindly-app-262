jest.mock('@nestjs/mapped-types', () => ({
    PartialType: (classRef: unknown) => classRef,
    OmitType: (classRef: unknown) => classRef,
    PickType: (classRef: unknown) => classRef,
    IntersectionType: (...classRefs: unknown[]) => classRefs[0],
}));

jest.mock('@nestjs/passport', () => ({
    AuthGuard: () => class {},
    PassportStrategy: () => class {},
}));

import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from '../entities/category.entity';
import { CategoryNotFoundException } from '../../common/exceptions';

describe('CategoryController', () => {
    let controller: CategoryController;
    let service: jest.Mocked<CategoryService>;

    const mockCategory: Category = {
        id: 1,
        name: 'Medio Ambiente',
        description: 'Conservacion',
        causes: [],
        volunteerCategories: [],
    };

    beforeEach(() => {
        service = {
            create: jest.fn(),
            findAll: jest.fn(),
            findByName: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
        } as unknown as jest.Mocked<CategoryService>;

        controller = new CategoryController(service);
    });

    describe('create', () => {
        it('should create a category', async () => {
            const dto: CreateCategoryDto = { name: 'Medio Ambiente', description: 'Conservacion' };
            service.create.mockResolvedValue(mockCategory);

            const result = await controller.create(dto);

            expect(result).toEqual(mockCategory);
            expect(service.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('findAll', () => {
        it('should return all categories', async () => {
            service.findAll.mockResolvedValue([mockCategory]);

            const result = await controller.findAll();

            expect(result).toEqual([mockCategory]);
            expect(service.findAll).toHaveBeenCalled();
        });
    });

    describe('findByName', () => {
        it('should return category when found by name', async () => {
            service.findByName.mockResolvedValue(mockCategory);

            const result = await controller.findByName('Medio Ambiente');

            expect(result).toEqual(mockCategory);
            expect(service.findByName).toHaveBeenCalledWith('Medio Ambiente');
        });

        it('should throw CategoryNotFoundException when category not found by name', async () => {
            service.findByName.mockResolvedValue(null);

            await expect(controller.findByName('Inexistente')).rejects.toThrow(CategoryNotFoundException);
        });
    });

    describe('findOne', () => {
        it('should return category by ID', async () => {
            service.findOne.mockResolvedValue(mockCategory);

            const result = await controller.findOne(1);

            expect(result).toEqual(mockCategory);
            expect(service.findOne).toHaveBeenCalledWith(1);
        });
    });

    describe('update', () => {
        it('should update category by ID', async () => {
            const dto: UpdateCategoryDto = { description: 'Updated' };
            service.update.mockResolvedValue({ ...mockCategory, description: 'Updated' });

            const result = await controller.update(1, dto);

            expect(result?.description).toBe('Updated');
            expect(service.update).toHaveBeenCalledWith(1, dto);
        });
    });

    describe('remove', () => {
        it('should remove category by ID', async () => {
            service.remove.mockResolvedValue(undefined);

            await controller.remove(1);

            expect(service.remove).toHaveBeenCalledWith(1);
        });
    });
});
