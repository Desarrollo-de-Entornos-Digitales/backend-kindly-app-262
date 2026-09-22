import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Achievement } from './entities/achievement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Achievement])],
  exports: [TypeOrmModule],
})
export class AchievementModule {}

