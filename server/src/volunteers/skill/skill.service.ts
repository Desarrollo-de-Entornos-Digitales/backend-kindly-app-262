import { ConflictException, Injectable } from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Skill } from '../entities/skill.entity';
import { Repository } from 'typeorm';
import { SkillNotFoundException } from '../../common/exceptions';

@Injectable()
export class SkillService {
    constructor(
        @InjectRepository(Skill)
        private readonly skillRepository: Repository<Skill>,
    ) {}

    async findAll(): Promise<Skill[]> {
        return await this.skillRepository.find();
    }

    async findOne(id: number): Promise<Skill> {
        const skill = await this.skillRepository.findOneBy({ id });
        if (!skill) {
            throw new SkillNotFoundException(id);
        }
        return skill;
    }

    async findByName(name: string): Promise<Skill | null> {
        return await this.skillRepository.findOneBy({ name });
    }

    async create(createSkillDto: CreateSkillDto): Promise<Skill> {
        const existingSkill = await this.findByName(createSkillDto.name);
        if (existingSkill) {
            throw new ConflictException(`Skill with name '${createSkillDto.name}' already exists`);
        }

        const newSkill = this.skillRepository.create(createSkillDto);
        return await this.skillRepository.save(newSkill);
    }

    async update(id: number, updateSkillDto: UpdateSkillDto): Promise<Skill | null> {
        await this.skillRepository.update(id, updateSkillDto);
        return await this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.findOne(id);
        await this.skillRepository.delete(id);
    }
}
