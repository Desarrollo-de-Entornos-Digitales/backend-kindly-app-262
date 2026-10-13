import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { VolunteerCategory } from '../entities/volunteer-category.entity';
import { Volunteer } from '../entities/volunteer.entity';
import { Category } from '../entities/category.entity';
import { CreateVolunteerCategoryDto } from './dto/create-volunteer-category.dto';
import { CategoryNotFoundException, VolunteerNotFoundException } from '../../common/exceptions';

@Injectable()
export class VolunteerCategoryService {
    constructor(
        @InjectRepository(VolunteerCategory)
        private readonly volunteerCategoryRepository: Repository<VolunteerCategory>,
        @InjectRepository(Volunteer)
        private readonly volunteerRepository: Repository<Volunteer>,
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) {}

    async create(createVolunteerCategoryDto: CreateVolunteerCategoryDto, userId?: number): Promise<VolunteerCategory> {
        let { volunteer_id } = createVolunteerCategoryDto;
        const { category_id } = createVolunteerCategoryDto;

        if (!volunteer_id && userId) {
            const vol = await this.volunteerRepository.findOneBy({ user_id: userId });
            if (!vol) {
                throw new VolunteerNotFoundException(undefined, `No volunteer profile found for user '${userId}'.`);
            }
            volunteer_id = vol.id;
        }

        if (!volunteer_id) {
            throw new VolunteerNotFoundException(undefined, 'volunteer_id is required.');
        }

        const volunteer = await this.volunteerRepository.findOneBy({ id: volunteer_id });
        if (!volunteer) {
            throw new VolunteerNotFoundException(volunteer_id);
        }

        const category = await this.categoryRepository.findOneBy({ id: category_id });
        if (!category) {
            throw new CategoryNotFoundException(category_id);
        }

        const existing = await this.volunteerCategoryRepository.findOneBy({ volunteer_id, category_id });
        if (existing) {
            throw new ConflictException(
                `Category with id '${category_id}' is already assigned to volunteer '${volunteer_id}'`,
            );
        }

        const newVolunteerCategory = this.volunteerCategoryRepository.create({ volunteer_id, category_id });
        return await this.volunteerCategoryRepository.save(newVolunteerCategory);
    }

    async findAll(volunteerId?: number): Promise<VolunteerCategory[]> {
        if (volunteerId) {
            return await this.volunteerCategoryRepository.find({
                where: { volunteer_id: volunteerId },
                relations: ['category'],
            });
        }

        return await this.volunteerCategoryRepository.find({
            relations: ['volunteer', 'category'],
        });
    }

    async findOne(volunteerId: number, categoryId: number): Promise<VolunteerCategory> {
        const volunteerCategory = await this.volunteerCategoryRepository.findOne({
            where: { volunteer_id: volunteerId, category_id: categoryId },
            relations: ['category'],
        });

        if (!volunteerCategory) {
            throw new NotFoundException(
                `Volunteer category relation for volunteer '${volunteerId}' and category '${categoryId}' not found`,
            );
        }

        return volunteerCategory;
    }

    async remove(volunteerId: number, categoryId: number): Promise<void> {
        await this.findOne(volunteerId, categoryId);
        await this.volunteerCategoryRepository.delete({ volunteer_id: volunteerId, category_id: categoryId });
    }
}
