import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VolunteerCategoryService } from './volunteer-category.service';
import { VolunteerCategoryController } from './volunteer-category.controller';
import { VolunteerCategory } from '../entities/volunteer-category.entity';
import { Volunteer } from '../entities/volunteer.entity';
import { Category } from '../entities/category.entity';

@Module({
    imports: [TypeOrmModule.forFeature([VolunteerCategory, Volunteer, Category])],
    controllers: [VolunteerCategoryController],
    providers: [VolunteerCategoryService],
    exports: [VolunteerCategoryService],
})
export class VolunteerCategoryModule {}
