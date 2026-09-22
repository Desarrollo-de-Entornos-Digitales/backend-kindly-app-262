import { Module } from '@nestjs/common';
import { AchievementModule } from './achievement/achievement.module';
import { VolunteerAchievementModule } from './volunteer-achievement/volunteer-achievement.module';

@Module({
  imports: [AchievementModule, VolunteerAchievementModule],
  exports: [AchievementModule, VolunteerAchievementModule],
})
export class AchievementsModule {}

