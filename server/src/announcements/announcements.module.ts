import { Module } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementModule } from './announcement/announcement.module';
import { ReactionModule } from './reaction/reaction.module';
import { AnnouncementReactionModule } from './announcement-reaction/announcement-reaction.module';

@Module({
  controllers: [AnnouncementsController],
  providers: [AnnouncementsService],
  imports: [AnnouncementModule, ReactionModule, AnnouncementReactionModule],
})
export class AnnouncementsModule {}
