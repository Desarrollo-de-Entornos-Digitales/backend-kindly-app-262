import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VolunteerAchievementService } from './volunteer-achievement.service';
import { VolunteerAchievementController } from './volunteer-achievement.controller';
import { VolunteerAchievement } from '../entities/volunteer-achievement.entity';
import { Volunteer } from '../../volunteers/entities/volunteer.entity';
import { Achievement } from '../entities/achievement.entity';

@Module({
    imports: [TypeOrmModule.forFeature([VolunteerAchievement, Volunteer, Achievement])],
    controllers: [VolunteerAchievementController],
    providers: [VolunteerAchievementService],
    exports: [VolunteerAchievementService],
})
export class VolunteerAchievementModule {}
