import { Injectable } from '@nestjs/common';
import { CreateAnnouncementReactionDto } from './dto/create-announcement-reaction.dto';
import { UpdateAnnouncementReactionDto } from './dto/update-announcement-reaction.dto';

@Injectable()
export class AnnouncementReactionService {
  create(createAnnouncementReactionDto: CreateAnnouncementReactionDto) {
    return 'This action adds a new announcementReaction';
  }

  findAll() {
    return `This action returns all announcementReaction`;
  }

  findOne(id: number) {
    return `This action returns a #${id} announcementReaction`;
  }

  update(id: number, updateAnnouncementReactionDto: UpdateAnnouncementReactionDto) {
    return `This action updates a #${id} announcementReaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} announcementReaction`;
  }
}
