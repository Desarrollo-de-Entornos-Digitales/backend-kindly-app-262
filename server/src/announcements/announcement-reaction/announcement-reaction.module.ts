import { Module } from '@nestjs/common';
import { AnnouncementReactionService } from './announcement-reaction.service';
import { AnnouncementReactionController } from './announcement-reaction.controller';

@Module({
    controllers: [AnnouncementReactionController],
    providers: [AnnouncementReactionService],
})
export class AnnouncementReactionModule {}
