import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryNotFoundException } from '../../common/exceptions';

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) {}

    async findAll(): Promise<Category[]> {
        return await this.categoryRepository.find({
            order: { name: 'ASC' },
        });
    }

    async findOne(id: number): Promise<Category> {
        const category = await this.categoryRepository.findOneBy({ id });
        if (!category) {
            throw new CategoryNotFoundException(id);
        }
        return category;
    }

    async findByName(name: string): Promise<Category | null> {
        return await this.categoryRepository.findOneBy({ name });
    }

    async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
        const existingCategory = await this.findByName(createCategoryDto.name);
        if (existingCategory) {
            throw new ConflictException(`Category with name '${createCategoryDto.name}' already exists`);
        }

        const newCategory = this.categoryRepository.create(createCategoryDto);
        return await this.categoryRepository.save(newCategory);
    }

    async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category | null> {
        await this.findOne(id);
        await this.categoryRepository.update(id, updateCategoryDto);
        return await this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.findOne(id);
        await this.categoryRepository.delete(id);
    }
}
