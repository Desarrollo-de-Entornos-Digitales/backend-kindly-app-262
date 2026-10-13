import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Volunteer } from './entities/volunteer.entity';
import { User } from '../users/entities/user.entity';
import { CreateVolunteerDto } from './volunteer/dto/create-volunteer.dto';
import { UpdateVolunteerDto } from './volunteer/dto/update-volunteer.dto';
import { QueryVolunteersDto } from './dto/query-volunteers.dto';
import { VolunteerNotFoundException, UserNotFoundException } from '../common/exceptions';

@Injectable()
export class VolunteersService {
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

    async findAll(query?: QueryVolunteersDto) {
        const page = query?.page && query.page > 0 ? Number(query.page) : 1;
        const limit = query?.limit && query.limit > 0 ? Number(query.limit) : 10;
        const skip = (page - 1) * limit;

        const qb = this.volunteerRepository
            .createQueryBuilder('volunteer')
            .leftJoinAndSelect('volunteer.user', 'user')
            .leftJoinAndSelect('volunteer.volunteerSkills', 'volunteerSkills')
            .leftJoinAndSelect('volunteerSkills.skill', 'skill')
            .leftJoinAndSelect('volunteer.volunteerCategories', 'volunteerCategories')
            .leftJoinAndSelect('volunteerCategories.category', 'category')
            .leftJoinAndSelect('volunteer.volunteerAchievements', 'volunteerAchievements')
            .leftJoinAndSelect('volunteerAchievements.achievement', 'achievement');

        if (query?.search) {
            const searchTerm = `%${query.search.trim()}%`;
            qb.andWhere(
                '(user.name ILIKE :search OR user.username ILIKE :search OR user.email ILIKE :search OR volunteer.description ILIKE :search)',
                { search: searchTerm },
            );
        }

        if (query?.skill_id) {
            qb.andWhere(
                'EXISTS (SELECT 1 FROM volunteer_skills vs WHERE vs.volunteer_id = volunteer.id AND vs.skill_id = :skillId)',
                { skillId: query.skill_id },
            );
        }

        if (query?.category_id) {
            qb.andWhere(
                'EXISTS (SELECT 1 FROM volunteer_categories vc WHERE vc.volunteer_id = volunteer.id AND vc.category_id = :categoryId)',
                { categoryId: query.category_id },
            );
        }

        qb.orderBy('volunteer.id', 'ASC').skip(skip).take(limit);

        const [items, total] = await qb.getManyAndCount();

        const data = items.map((item) => this.sanitize(item));

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1,
            },
        };
    }

    async findOne(id: number): Promise<Volunteer> {
        const volunteer = await this.volunteerRepository.findOne({
            where: { id },
            relations: [
                'user',
                'volunteerSkills.skill',
                'volunteerCategories.category',
                'volunteerAchievements.achievement',
                'submissions',
                'attendances',
            ],
        });

        if (!volunteer) {
            throw new VolunteerNotFoundException(id);
        }

        return this.sanitize(volunteer);
    }

    async findByUserId(userId: number): Promise<Volunteer> {
        const volunteer = await this.volunteerRepository.findOne({
            where: { user_id: userId },
            relations: [
                'user',
                'volunteerSkills.skill',
                'volunteerCategories.category',
                'volunteerAchievements.achievement',
                'submissions',
                'attendances',
            ],
        });

        if (!volunteer) {
            throw new VolunteerNotFoundException(undefined, `No volunteer profile found for user '${userId}'.`);
        }

        return this.sanitize(volunteer);
    }

    async update(id: number, updateVolunteerDto: UpdateVolunteerDto): Promise<Volunteer> {
        const volunteer = await this.volunteerRepository.findOneBy({ id });
        if (!volunteer) {
            throw new VolunteerNotFoundException(id);
        }

        const { user_id: _userId, ...dataToUpdate } = updateVolunteerDto;
        await this.volunteerRepository.update(id, dataToUpdate);
        return await this.findOne(id);
    }

    async updateByUserId(userId: number, updateVolunteerDto: UpdateVolunteerDto): Promise<Volunteer> {
        const volunteer = await this.volunteerRepository.findOneBy({ user_id: userId });
        if (!volunteer) {
            throw new VolunteerNotFoundException(undefined, `No volunteer profile found for user '${userId}'.`);
        }

        const { user_id: _userId, ...dataToUpdate } = updateVolunteerDto;
        await this.volunteerRepository.update(volunteer.id, dataToUpdate);
        return await this.findOne(volunteer.id);
    }

    async remove(id: number): Promise<void> {
        const volunteer = await this.volunteerRepository.findOneBy({ id });
        if (!volunteer) {
            throw new VolunteerNotFoundException(id);
        }

        await this.volunteerRepository.delete(id);
    }

    private sanitize(volunteer: Volunteer): Volunteer {
        if (volunteer.user) {
            delete (volunteer.user as Partial<User>).password;
        }
        return volunteer;
    }
}
