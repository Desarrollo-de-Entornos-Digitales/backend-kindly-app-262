import { Module } from '@nestjs/common';
import { VolunteerCategoryService } from './volunteer-category.service';
import { VolunteerCategoryController } from './volunteer-category.controller';

@Module({
    controllers: [VolunteerCategoryController],
    providers: [VolunteerCategoryService],
})
export class VolunteerCategoryModule {}
