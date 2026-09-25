import { Injectable } from '@nestjs/common';
import { CreateVolunteerAchievementDto } from './dto/create-volunteer-achievement.dto';
import { UpdateVolunteerAchievementDto } from './dto/update-volunteer-achievement.dto';

@Injectable()
export class VolunteerAchievementService {
  create(createVolunteerAchievementDto: CreateVolunteerAchievementDto) {
    return 'This action adds a new volunteerAchievement';
  }

  findAll() {
    return `This action returns all volunteerAchievement`;
  }

  findOne(id: number) {
    return `This action returns a #${id} volunteerAchievement`;
  }

  update(id: number, updateVolunteerAchievementDto: UpdateVolunteerAchievementDto) {
    return `This action updates a #${id} volunteerAchievement`;
  }

  remove(id: number) {
    return `This action removes a #${id} volunteerAchievement`;
  }
}
