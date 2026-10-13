import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnnouncementsService } from './announcements.service';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementImagesController } from './announcement-images.controller';
import { AnnouncementLikesController } from './announcement-likes.controller';
import { Announcement } from './entities/announcement.entity';
import { Cause } from '../causes/entities/cause.entity';
import { Organizer } from '../organizations/entities/organizer.entity';
import { Image } from '../media/entities/image.entity';
import { AnnouncementReaction } from './entities/announcement-reaction.entity';
import { Reaction } from './entities/reaction.entity';
import { AuthModule } from '../auth/auth.module';
import { AnnouncementModule } from './announcement/announcement.module';
import { ReactionModule } from './reaction/reaction.module';
import { AnnouncementReactionModule } from './announcement-reaction/announcement-reaction.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Announcement, Cause, Organizer, Image, AnnouncementReaction, Reaction]),
        AuthModule,
        AnnouncementModule,
        ReactionModule,
        AnnouncementReactionModule,
    ],
    controllers: [AnnouncementsController, AnnouncementImagesController, AnnouncementLikesController],
    providers: [AnnouncementsService],
    exports: [AnnouncementsService],
})
export class AnnouncementsModule {}
