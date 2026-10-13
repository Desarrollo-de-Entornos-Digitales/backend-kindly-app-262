import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { ConflictException } from '@nestjs/common';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';

import { CategoryService } from './category.service';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryNotFoundException } from '../../common/exceptions';

describe('CategoryService', () => {
    let service: CategoryService;

    let categoryRepository: {
        find: jest.Mock<(...args: unknown[]) => Promise<Category[]>>;
        findOneBy: jest.Mock<(...args: unknown[]) => Promise<Category | null>>;
        create: jest.Mock<(...args: unknown[]) => Category>;
        save: jest.Mock<(...args: unknown[]) => Promise<Category>>;
        update: jest.Mock<(...args: unknown[]) => Promise<UpdateResult>>;
        delete: jest.Mock<(...args: unknown[]) => Promise<DeleteResult>>;
    };

    const createMockCategory = (overrides?: Partial<Category>): Category => {
        const category = new Category();
        category.id = 1;
        category.name = 'Educación';
        category.description = 'Causas enfocadas en enseñanza y apoyo escolar';
        category.causes = [];
        category.volunteerCategories = [];
        return Object.assign(category, overrides);
    };

    beforeEach(() => {
        categoryRepository = {
            find: jest.fn(() => Promise.resolve([createMockCategory()])),
            findOneBy: jest.fn(() => Promise.resolve(createMockCategory())),
            create: jest.fn((entity: unknown) => Object.assign(new Category(), entity)),
            save: jest.fn((entity: Category) => Promise.resolve(entity)),
            update: jest.fn(() => Promise.resolve({ affected: 1, raw: [], generatedMaps: [] } as UpdateResult)),
            delete: jest.fn(() => Promise.resolve({ affected: 1, raw: [] } as DeleteResult)),
        };

        service = new CategoryService(categoryRepository as unknown as Repository<Category>);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all categories ordered by name ascending', async () => {
            const categories = [
                createMockCategory({ id: 2, name: 'Ambiente' }),
                createMockCategory({ id: 1, name: 'Educación' }),
            ];
            categoryRepository.find.mockResolvedValue(categories);

            const result = await service.findAll();

            expect(categoryRepository.find).toHaveBeenCalledWith({
                order: { name: 'ASC' },
            });
            expect(result).toEqual(categories);
        });

        it('should return an empty array when no categories exist', async () => {
            categoryRepository.find.mockResolvedValue([]);

            const result = await service.findAll();

            expect(result).toEqual([]);
        });

        it('should propagate repository error when find fails', async () => {
            categoryRepository.find.mockRejectedValue(new Error('Database query failure'));

            await expect(service.findAll()).rejects.toThrow('Database query failure');
        });
    });

    describe('findOne', () => {
        it('should return the category when found by id', async () => {
            const category = createMockCategory({ id: 1, name: 'Educación' });
            categoryRepository.findOneBy.mockResolvedValue(category);

            const result = await service.findOne(1);

            expect(categoryRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
            expect(result).toEqual(category);
        });

        it('should throw CategoryNotFoundException when category does not exist', async () => {
            categoryRepository.findOneBy.mockResolvedValue(null);

            await expect(service.findOne(99)).rejects.toThrow(CategoryNotFoundException);
            await expect(service.findOne(99)).rejects.toThrow("Category with identifier '99' not found.");
        });

        it('should propagate repository error when findOneBy fails', async () => {
            categoryRepository.findOneBy.mockRejectedValue(new Error('Connection error'));

            await expect(service.findOne(1)).rejects.toThrow('Connection error');
        });
    });

    describe('findByName', () => {
        it('should return the category when found by name', async () => {
            const category = createMockCategory({ name: 'Salud' });
            categoryRepository.findOneBy.mockResolvedValue(category);

            const result = await service.findByName('Salud');

            expect(categoryRepository.findOneBy).toHaveBeenCalledWith({ name: 'Salud' });
            expect(result).toEqual(category);
        });

        it('should return null when category name is not found', async () => {
            categoryRepository.findOneBy.mockResolvedValue(null);

            const result = await service.findByName('Inexistente');

            expect(result).toBeNull();
        });

        it('should propagate repository error when findByName lookup fails', async () => {
            categoryRepository.findOneBy.mockRejectedValue(new Error('Read timeout'));

            await expect(service.findByName('Salud')).rejects.toThrow('Read timeout');
        });
    });

    describe('create', () => {
        const dto: CreateCategoryDto = {
            name: 'Comunidad',
            description: 'Apoyo a comunidades vulnerables',
        };

        it('should successfully create and return a new category', async () => {
            categoryRepository.findOneBy.mockResolvedValue(null);
            const savedCategory = createMockCategory({ id: 10, ...dto });
            categoryRepository.save.mockResolvedValue(savedCategory);

            const result = await service.create(dto);

            expect(categoryRepository.findOneBy).toHaveBeenCalledWith({ name: 'Comunidad' });
            expect(categoryRepository.create).toHaveBeenCalledWith(dto);
            expect(categoryRepository.save).toHaveBeenCalled();
            expect(result).toEqual(savedCategory);
        });

        it('should throw ConflictException when category name already exists', async () => {
            const existing = createMockCategory({ name: 'Comunidad' });
            categoryRepository.findOneBy.mockResolvedValue(existing);

            await expect(service.create(dto)).rejects.toThrow(ConflictException);
            await expect(service.create(dto)).rejects.toThrow("Category with name 'Comunidad' already exists");
            expect(categoryRepository.create).not.toHaveBeenCalled();
            expect(categoryRepository.save).not.toHaveBeenCalled();
        });

        it('should propagate repository error when save fails', async () => {
            categoryRepository.findOneBy.mockResolvedValue(null);
            categoryRepository.save.mockRejectedValue(new Error('Save constraint error'));

            await expect(service.create(dto)).rejects.toThrow('Save constraint error');
        });
    });

    describe('update', () => {
        const updateDto: UpdateCategoryDto = {
            name: 'Educación y Cultura',
            description: 'Nueva descripción actualizada',
        };

        it('should successfully update and return the updated category', async () => {
            const existing = createMockCategory({ id: 1, name: 'Educación' });
            const updated = createMockCategory({ id: 1, ...updateDto });
            categoryRepository.findOneBy.mockResolvedValueOnce(existing).mockResolvedValueOnce(updated);

            const result = await service.update(1, updateDto);

            expect(categoryRepository.update).toHaveBeenCalledWith(1, updateDto);
            expect(result).toEqual(updated);
        });

        it('should throw CategoryNotFoundException when category to update does not exist', async () => {
            categoryRepository.findOneBy.mockResolvedValue(null);

            await expect(service.update(99, updateDto)).rejects.toThrow(CategoryNotFoundException);
            expect(categoryRepository.update).not.toHaveBeenCalled();
        });

        it('should propagate repository error when update fails', async () => {
            categoryRepository.findOneBy.mockResolvedValue(createMockCategory());
            categoryRepository.update.mockRejectedValue(new Error('Update DB error'));

            await expect(service.update(1, updateDto)).rejects.toThrow('Update DB error');
        });
    });

    describe('remove', () => {
        it('should successfully delete category when found', async () => {
            const existing = createMockCategory({ id: 1 });
            categoryRepository.findOneBy.mockResolvedValue(existing);

            await service.remove(1);

            expect(categoryRepository.delete).toHaveBeenCalledWith(1);
        });

        it('should throw CategoryNotFoundException when category to delete does not exist', async () => {
            categoryRepository.findOneBy.mockResolvedValue(null);

            await expect(service.remove(99)).rejects.toThrow(CategoryNotFoundException);
            expect(categoryRepository.delete).not.toHaveBeenCalled();
        });

        it('should propagate repository error when delete fails', async () => {
            categoryRepository.findOneBy.mockResolvedValue(createMockCategory());
            categoryRepository.delete.mockRejectedValue(new Error('Delete error'));

            await expect(service.remove(1)).rejects.toThrow('Delete error');
        });
    });
});
