import { Module } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { AchievementsController } from './achievements.controller';
import { AchievementModule } from './achievement/achievement.module';
import { VolunteerAchievementModule } from './volunteer-achievement/volunteer-achievement.module';

@Module({
    controllers: [AchievementsController],
    providers: [AchievementsService],
    imports: [AchievementModule, VolunteerAchievementModule],
})
export class AchievementsModule {}
