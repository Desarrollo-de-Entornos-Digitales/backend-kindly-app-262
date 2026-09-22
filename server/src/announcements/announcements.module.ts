import { Module } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementSubModule } from './announcement/announcement.module';
import { ReactionModule } from './reaction/reaction.module';
import { AnnouncementReactionModule } from './announcement-reaction/announcement-reaction.module';

@Module({
  imports: [
    AnnouncementSubModule,
    ReactionModule,
    AnnouncementReactionModule,
  ],
  controllers: [AnnouncementsController],
  providers: [AnnouncementsService],
  exports: [
    AnnouncementSubModule,
    ReactionModule,
    AnnouncementReactionModule,
  ],
})
export class AnnouncementsModule {}
