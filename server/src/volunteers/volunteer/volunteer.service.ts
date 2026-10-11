import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Volunteer } from '../entities/volunteer.entity';
import { User } from '../../users/entities/user.entity';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { UpdateVolunteerDto } from './dto/update-volunteer.dto';
import { VolunteerNotFoundException, UserNotFoundException } from '../../common/exceptions';

@Injectable()
export class VolunteerService {
    constructor(
        @InjectRepository(Volunteer)
        private readonly volunteerRepository: Repository<Volunteer>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async create(createVolunteerDto: CreateVolunteerDto): Promise<Volunteer> {
        const user = await this.userRepository.findOneBy({ id: createVolunteerDto.user_id });
        if (!user) {
            throw new UserNotFoundException(createVolunteerDto.user_id);
        }

        const existing = await this.volunteerRepository.findOneBy({
            user_id: createVolunteerDto.user_id,
        });
        if (existing) {
            throw new ConflictException(`Volunteer profile already exists for user_id '${createVolunteerDto.user_id}'`);
        }

        const newVolunteer = this.volunteerRepository.create(createVolunteerDto);
        const saved = await this.volunteerRepository.save(newVolunteer);
        return await this.findOne(saved.id);
    }

    async findAll(): Promise<Volunteer[]> {
        const volunteers = await this.volunteerRepository.find({
            relations: ['user', 'volunteerSkills.skill', 'volunteerCategories.category'],
        });

        return volunteers.map((volunteer) => this.sanitize(volunteer));
    }

    async findOne(id: number): Promise<Volunteer> {
        const volunteer = await this.volunteerRepository.findOne({
            where: { id },
            relations: [
                'user',
                'volunteerSkills.skill',
                'volunteerCategories.category',
                'volunteerAchievements.achievement',
            ],
        });

        if (!volunteer) {
            throw new VolunteerNotFoundException(id);
        }

        return this.sanitize(volunteer);
    }

    async update(id: number, updateVolunteerDto: UpdateVolunteerDto): Promise<Volunteer> {
        await this.findOne(id);
        const { user_id: _userId, ...dataToUpdate } = updateVolunteerDto;
        await this.volunteerRepository.update(id, dataToUpdate);
        return await this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.findOne(id);
        await this.volunteerRepository.delete(id);
    }

    private sanitize(volunteer: Volunteer): Volunteer {
        if (volunteer.user) {
            delete (volunteer.user as Partial<User>).password;
        }
        return volunteer;
    }
}
