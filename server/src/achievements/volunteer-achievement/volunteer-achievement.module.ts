import { Module } from '@nestjs/common';
import { VolunteerAchievementService } from './volunteer-achievement.service';
import { VolunteerAchievementController } from './volunteer-achievement.controller';

@Module({
  controllers: [VolunteerAchievementController],
  providers: [VolunteerAchievementService],
})
export class VolunteerAchievementModule {}
