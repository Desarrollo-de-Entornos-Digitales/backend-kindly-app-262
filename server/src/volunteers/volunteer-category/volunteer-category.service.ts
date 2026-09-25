import { Injectable } from '@nestjs/common';
import { CreateVolunteerCategoryDto } from './dto/create-volunteer-category.dto';
import { UpdateVolunteerCategoryDto } from './dto/update-volunteer-category.dto';

@Injectable()
export class VolunteerCategoryService {
  create(createVolunteerCategoryDto: CreateVolunteerCategoryDto) {
    return 'This action adds a new volunteerCategory';
  }

  findAll() {
    return `This action returns all volunteerCategory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} volunteerCategory`;
  }

  update(id: number, updateVolunteerCategoryDto: UpdateVolunteerCategoryDto) {
    return `This action updates a #${id} volunteerCategory`;
  }

  remove(id: number) {
    return `This action removes a #${id} volunteerCategory`;
  }
}
