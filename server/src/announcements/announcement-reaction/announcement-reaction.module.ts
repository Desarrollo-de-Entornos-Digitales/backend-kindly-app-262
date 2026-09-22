import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnnouncementReaction } from './entities/announcement-reaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AnnouncementReaction])],
  exports: [TypeOrmModule],
})
export class AnnouncementReactionModule {}

