import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AchievementsService } from './achievements.service';
import { AchievementsController } from './achievements.controller';
import { AchievementModule } from './achievement/achievement.module';
import { VolunteerAchievementModule } from './volunteer-achievement/volunteer-achievement.module';
import { Achievement } from './entities/achievement.entity';
import { VolunteerAchievement } from './entities/volunteer-achievement.entity';
import { Volunteer } from '../volunteers/entities/volunteer.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Achievement, VolunteerAchievement, Volunteer]),
        AchievementModule,
        VolunteerAchievementModule,
        AuthModule,
    ],
    controllers: [AchievementsController],
    providers: [AchievementsService],
    exports: [AchievementsService, AchievementModule, VolunteerAchievementModule],
})
export class AchievementsModule {}
