import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { VolunteerSkill } from '../entities/volunteer-skill.entity';
import { Volunteer } from '../entities/volunteer.entity';
import { Skill } from '../entities/skill.entity';
import { CreateVolunteerSkillDto } from './dto/create-volunteer-skill.dto';
import { SkillNotFoundException, VolunteerNotFoundException } from '../../common/exceptions';

@Injectable()
export class VolunteerSkillService {
    constructor(
        @InjectRepository(VolunteerSkill)
        private readonly volunteerSkillRepository: Repository<VolunteerSkill>,
        @InjectRepository(Volunteer)
        private readonly volunteerRepository: Repository<Volunteer>,
        @InjectRepository(Skill)
        private readonly skillRepository: Repository<Skill>,
    ) {}

    async create(createVolunteerSkillDto: CreateVolunteerSkillDto): Promise<VolunteerSkill> {
        const { volunteer_id, skill_id } = createVolunteerSkillDto;

        // validate volunteer existence
        const volunteer = await this.volunteerRepository.findOneBy({ id: volunteer_id });
        if (!volunteer) {
            throw new VolunteerNotFoundException(volunteer_id);
        }

        // validate skill existence
        const skill = await this.skillRepository.findOneBy({ id: skill_id });
        if (!skill) {
            throw new SkillNotFoundException(skill_id);
        }

        // prevent duplications
        const existing = await this.volunteerSkillRepository.findOneBy({ volunteer_id, skill_id });
        if (existing) {
            throw new ConflictException(
                `Skill with id '${skill_id}' is already assigned to volunteer '${volunteer_id}'`,
            );
        }

        const newVolunteerSkill = this.volunteerSkillRepository.create(createVolunteerSkillDto);
        return await this.volunteerSkillRepository.save(newVolunteerSkill);
    }

    async findAll(volunteerId?: number): Promise<VolunteerSkill[]> {
        if (volunteerId) {
            return await this.volunteerSkillRepository.find({
                where: { volunteer_id: volunteerId },
                relations: ['skill'],
            });
        }

        return await this.volunteerSkillRepository.find({
            relations: ['volunteer', 'skill'],
        });
    }

    async findOne(volunteerId: number, skillId: number): Promise<VolunteerSkill> {
        const volunteerSkill = await this.volunteerSkillRepository.findOne({
            where: { volunteer_id: volunteerId, skill_id: skillId },
            relations: ['skill'],
        });

        if (!volunteerSkill) {
            throw new NotFoundException(
                `Volunteer skill relation for volunteer '${volunteerId}' and skill '${skillId}' not found`,
            );
        }

        return volunteerSkill;
    }

    async remove(volunteerId: number, skillId: number): Promise<void> {
        await this.findOne(volunteerId, skillId);
        await this.volunteerSkillRepository.delete({ volunteer_id: volunteerId, skill_id: skillId });
    }
}
