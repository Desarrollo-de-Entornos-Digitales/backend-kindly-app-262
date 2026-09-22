import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VolunteerCategory } from './entities/volunteer-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VolunteerCategory])],
  exports: [TypeOrmModule],
})
export class VolunteerCategoryModule {}

