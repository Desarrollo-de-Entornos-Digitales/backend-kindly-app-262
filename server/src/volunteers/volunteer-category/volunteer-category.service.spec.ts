import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DeleteResult, Repository } from 'typeorm';

import { VolunteerCategoryService } from './volunteer-category.service';
import { VolunteerCategory } from '../entities/volunteer-category.entity';
import { Volunteer } from '../entities/volunteer.entity';
import { Category } from '../entities/category.entity';
import { CreateVolunteerCategoryDto } from './dto/create-volunteer-category.dto';
import { CategoryNotFoundException, VolunteerNotFoundException } from '../../common/exceptions';

describe('VolunteerCategoryService', () => {
    let service: VolunteerCategoryService;

    let volunteerCategoryRepository: {
        create: jest.Mock<(...args: unknown[]) => VolunteerCategory>;
        save: jest.Mock<(...args: unknown[]) => Promise<VolunteerCategory>>;
        find: jest.Mock<(...args: unknown[]) => Promise<VolunteerCategory[]>>;
        findOne: jest.Mock<(...args: unknown[]) => Promise<VolunteerCategory | null>>;
        findOneBy: jest.Mock<(...args: unknown[]) => Promise<VolunteerCategory | null>>;
        delete: jest.Mock<(...args: unknown[]) => Promise<DeleteResult>>;
    };

    let volunteerRepository: {
        findOneBy: jest.Mock<(...args: unknown[]) => Promise<Volunteer | null>>;
    };

    let categoryRepository: {
        findOneBy: jest.Mock<(...args: unknown[]) => Promise<Category | null>>;
    };

    const createMockVolunteer = (overrides?: Partial<Volunteer>): Volunteer => {
        const volunteer = new Volunteer();
        volunteer.id = 1;
        volunteer.user_id = 10;
        volunteer.description = 'Voluntario ambiental';
        volunteer.shirt_size = 'S';
        volunteer.height = '1.65';
        volunteer.health_center = 'Centro Salud Sur';
        volunteer.blood_type = 'B+';
        volunteer.emergency_contact = '3157654321';
        volunteer.completed_causes = 4;
        volunteer.volunteerAchievements = [];
        volunteer.volunteerSkills = [];
        volunteer.volunteerCategories = [];
        return Object.assign(volunteer, overrides);
    };

    const createMockCategory = (overrides?: Partial<Category>): Category => {
        const category = new Category();
        category.id = 2;
        category.name = 'Medio Ambiente';
        category.description = 'Causas enfocadas en sostenibilidad y ecología';
        category.causes = [];
        category.volunteerCategories = [];
        return Object.assign(category, overrides);
    };

    const createMockVolunteerCategory = (overrides?: Partial<VolunteerCategory>): VolunteerCategory => {
        const vc = new VolunteerCategory();
        vc.volunteer_id = 1;
        vc.category_id = 2;
        vc.volunteer = createMockVolunteer();
        vc.category = createMockCategory();
        return Object.assign(vc, overrides);
    };

    beforeEach(() => {
        volunteerCategoryRepository = {
            create: jest.fn((entity: unknown) => Object.assign(new VolunteerCategory(), entity)),
            save: jest.fn((entity: VolunteerCategory) => Promise.resolve(entity)),
            find: jest.fn(() => Promise.resolve([createMockVolunteerCategory()])),
            findOne: jest.fn(() => Promise.resolve(createMockVolunteerCategory())),
            findOneBy: jest.fn(() => Promise.resolve(null)),
            delete: jest.fn(() => Promise.resolve({ affected: 1, raw: [] } as DeleteResult)),
        };

        volunteerRepository = {
            findOneBy: jest.fn(() => Promise.resolve(createMockVolunteer())),
        };

        categoryRepository = {
            findOneBy: jest.fn(() => Promise.resolve(createMockCategory())),
        };

        service = new VolunteerCategoryService(
            volunteerCategoryRepository as unknown as Repository<VolunteerCategory>,
            volunteerRepository as unknown as Repository<Volunteer>,
            categoryRepository as unknown as Repository<Category>,
        );
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        const dto: CreateVolunteerCategoryDto = {
            volunteer_id: 1,
            category_id: 2,
        };

        it('should create and return the new volunteer category relation', async () => {
            const result = await service.create(dto);

            expect(volunteerRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
            expect(categoryRepository.findOneBy).toHaveBeenCalledWith({ id: 2 });
            expect(volunteerCategoryRepository.findOneBy).toHaveBeenCalledWith({
                volunteer_id: 1,
                category_id: 2,
            });
            expect(volunteerCategoryRepository.create).toHaveBeenCalledWith(dto);
            expect(volunteerCategoryRepository.save).toHaveBeenCalled();
            expect(result.volunteer_id).toBe(1);
            expect(result.category_id).toBe(2);
        });

        it('should throw VolunteerNotFoundException when volunteer does not exist', async () => {
            volunteerRepository.findOneBy.mockResolvedValue(null);

            await expect(service.create(dto)).rejects.toThrow(VolunteerNotFoundException);
            await expect(service.create(dto)).rejects.toThrow("Volunteer with identifier '1' not found.");
            expect(categoryRepository.findOneBy).not.toHaveBeenCalled();
            expect(volunteerCategoryRepository.save).not.toHaveBeenCalled();
        });

        it('should throw CategoryNotFoundException when category does not exist', async () => {
            categoryRepository.findOneBy.mockResolvedValue(null);

            await expect(service.create(dto)).rejects.toThrow(CategoryNotFoundException);
            await expect(service.create(dto)).rejects.toThrow("Category with identifier '2' not found.");
            expect(volunteerCategoryRepository.findOneBy).not.toHaveBeenCalled();
            expect(volunteerCategoryRepository.save).not.toHaveBeenCalled();
        });

        it('should throw ConflictException when category is already assigned to the volunteer', async () => {
            volunteerCategoryRepository.findOneBy.mockResolvedValue(createMockVolunteerCategory());

            await expect(service.create(dto)).rejects.toThrow(ConflictException);
            await expect(service.create(dto)).rejects.toThrow(
                "Category with id '2' is already assigned to volunteer '1'",
            );
            expect(volunteerCategoryRepository.create).not.toHaveBeenCalled();
            expect(volunteerCategoryRepository.save).not.toHaveBeenCalled();
        });

        it('should propagate repository error when volunteer lookup fails', async () => {
            volunteerRepository.findOneBy.mockRejectedValue(new Error('Volunteer read error'));

            await expect(service.create(dto)).rejects.toThrow('Volunteer read error');
        });

        it('should propagate repository error when category lookup fails', async () => {
            categoryRepository.findOneBy.mockRejectedValue(new Error('Category read error'));

            await expect(service.create(dto)).rejects.toThrow('Category read error');
        });

        it('should propagate repository error when save fails', async () => {
            volunteerCategoryRepository.save.mockRejectedValue(new Error('Save rejected by database'));

            await expect(service.create(dto)).rejects.toThrow('Save rejected by database');
        });
    });

    describe('findAll', () => {
        it('should return all volunteer category relations with volunteer and category relations when no volunteerId is provided', async () => {
            const records = [
                createMockVolunteerCategory({ volunteer_id: 1, category_id: 2 }),
                createMockVolunteerCategory({ volunteer_id: 2, category_id: 4 }),
            ];
            volunteerCategoryRepository.find.mockResolvedValue(records);

            const result = await service.findAll();

            expect(volunteerCategoryRepository.find).toHaveBeenCalledWith({
                relations: ['volunteer', 'category'],
            });
            expect(result).toEqual(records);
        });

        it('should return categories filtered by volunteerId with category relation when volunteerId is provided', async () => {
            const records = [createMockVolunteerCategory({ volunteer_id: 1, category_id: 2 })];
            volunteerCategoryRepository.find.mockResolvedValue(records);

            const result = await service.findAll(1);

            expect(volunteerCategoryRepository.find).toHaveBeenCalledWith({
                where: { volunteer_id: 1 },
                relations: ['category'],
            });
            expect(result).toEqual(records);
        });

        it('should return empty array when no relations are found', async () => {
            volunteerCategoryRepository.find.mockResolvedValue([]);

            const result = await service.findAll(88);

            expect(result).toEqual([]);
        });

        it('should propagate repository error when find fails', async () => {
            volunteerCategoryRepository.find.mockRejectedValue(new Error('Database search failed'));

            await expect(service.findAll()).rejects.toThrow('Database search failed');
        });
    });

    describe('findOne', () => {
        it('should return the volunteer category relation when found', async () => {
            const expected = createMockVolunteerCategory();
            volunteerCategoryRepository.findOne.mockResolvedValue(expected);

            const result = await service.findOne(1, 2);

            expect(volunteerCategoryRepository.findOne).toHaveBeenCalledWith({
                where: { volunteer_id: 1, category_id: 2 },
                relations: ['category'],
            });
            expect(result).toEqual(expected);
        });

        it('should throw NotFoundException when relation does not exist', async () => {
            volunteerCategoryRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne(1, 99)).rejects.toThrow(NotFoundException);
            await expect(service.findOne(1, 99)).rejects.toThrow(
                "Volunteer category relation for volunteer '1' and category '99' not found",
            );
        });

        it('should propagate repository error when findOne fails', async () => {
            volunteerCategoryRepository.findOne.mockRejectedValue(new Error('Query timeout error'));

            await expect(service.findOne(1, 2)).rejects.toThrow('Query timeout error');
        });
    });

    describe('remove', () => {
        it('should remove the volunteer category relation when found', async () => {
            const existing = createMockVolunteerCategory();
            volunteerCategoryRepository.findOne.mockResolvedValue(existing);

            await service.remove(1, 2);

            expect(volunteerCategoryRepository.findOne).toHaveBeenCalledWith({
                where: { volunteer_id: 1, category_id: 2 },
                relations: ['category'],
            });
            expect(volunteerCategoryRepository.delete).toHaveBeenCalledWith({
                volunteer_id: 1,
                category_id: 2,
            });
        });

        it('should throw NotFoundException when relation to remove does not exist', async () => {
            volunteerCategoryRepository.findOne.mockResolvedValue(null);

            await expect(service.remove(1, 99)).rejects.toThrow(NotFoundException);
            expect(volunteerCategoryRepository.delete).not.toHaveBeenCalled();
        });

        it('should propagate repository error when delete fails', async () => {
            const existing = createMockVolunteerCategory();
            volunteerCategoryRepository.findOne.mockResolvedValue(existing);
            volunteerCategoryRepository.delete.mockRejectedValue(new Error('Delete DB failure'));

            await expect(service.remove(1, 2)).rejects.toThrow('Delete DB failure');
        });
    });
});
