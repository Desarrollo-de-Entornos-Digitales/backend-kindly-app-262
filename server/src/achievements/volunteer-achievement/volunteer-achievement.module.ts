import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VolunteerAchievement } from './entities/volunteer-achievement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VolunteerAchievement])],
  exports: [TypeOrmModule],
})
export class VolunteerAchievementModule {}

