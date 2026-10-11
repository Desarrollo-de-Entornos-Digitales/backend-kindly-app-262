import { PartialType } from '@nestjs/mapped-types';
import { CreateAnnouncementReactionDto } from './create-announcement-reaction.dto';

export class UpdateAnnouncementReactionDto extends PartialType(CreateAnnouncementReactionDto) {}
