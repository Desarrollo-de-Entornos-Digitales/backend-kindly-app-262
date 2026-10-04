import { Injectable } from '@nestjs/common';
import { CreateVolunteerSkillDto } from './dto/create-volunteer-skill.dto';
import { UpdateVolunteerSkillDto } from './dto/update-volunteer-skill.dto';

@Injectable()
export class VolunteerSkillService {
    create(_createVolunteerSkillDto: CreateVolunteerSkillDto) {
        return 'This action adds a new volunteerSkill';
    }

    findAll() {
        return `This action returns all volunteerSkill`;
    }

    findOne(id: number) {
        return `This action returns a #${id} volunteerSkill`;
    }

    update(id: number, _updateVolunteerSkillDto: UpdateVolunteerSkillDto) {
        return `This action updates a #${id} volunteerSkill`;
    }

    remove(id: number) {
        return `This action removes a #${id} volunteerSkill`;
    }
}
