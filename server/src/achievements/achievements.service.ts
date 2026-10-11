import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement } from './entities/achievement.entity';
import { VolunteerAchievement } from './entities/volunteer-achievement.entity';
import { Volunteer } from '../volunteers/entities/volunteer.entity';
import { CreateAchievementDto } from './achievement/dto/create-achievement.dto';
import { UpdateAchievementDto } from './achievement/dto/update-achievement.dto';
import { QueryAchievementsDto } from './dto/query-achievements.dto';
import { AchievementNotFoundException, VolunteerNotFoundException } from '../common/exceptions';

@Injectable()
export class AchievementsService {
    constructor(
        @InjectRepository(Achievement)
        private readonly achievementRepository: Repository<Achievement>,
        @InjectRepository(VolunteerAchievement)
        private readonly volunteerAchievementRepository: Repository<VolunteerAchievement>,
        @InjectRepository(Volunteer)
        private readonly volunteerRepository: Repository<Volunteer>,
    ) {}

    async create(createAchievementDto: CreateAchievementDto): Promise<Achievement> {
        const existing = await this.findByName(createAchievementDto.name);
        if (existing) {
            throw new ConflictException(`Achievement with name '${createAchievementDto.name}' already exists.`);
        }

        const achievement = this.achievementRepository.create(createAchievementDto);
        return await this.achievementRepository.save(achievement);
    }

    async findAll(query?: QueryAchievementsDto) {
        const page = query?.page && query.page > 0 ? Number(query.page) : 1;
        const limit = query?.limit && query.limit > 0 ? Number(query.limit) : 10;
        const skip = (page - 1) * limit;

        const qb = this.achievementRepository.createQueryBuilder('achievement');

        if (query?.search) {
            const searchTerm = `%${query.search.trim()}%`;
            qb.where('(achievement.name ILIKE :search OR achievement.description ILIKE :search)', {
                search: searchTerm,
            });
        }

        qb.orderBy('achievement.id', 'ASC').skip(skip).take(limit);

        const [data, total] = await qb.getManyAndCount();

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

    async findOne(id: number): Promise<Achievement> {
        const achievement = await this.achievementRepository.findOne({
            where: { id },
        });

        if (!achievement) {
            throw new AchievementNotFoundException(id);
        }

        return achievement;
    }

    async findByName(name: string): Promise<Achievement | null> {
        return await this.achievementRepository.findOne({
            where: { name },
        });
    }

    async update(id: number, updateAchievementDto: UpdateAchievementDto): Promise<Achievement> {
        await this.findOne(id);

        if (updateAchievementDto.name) {
            const existing = await this.findByName(updateAchievementDto.name);
            if (existing && existing.id !== id) {
                throw new ConflictException(`Achievement with name '${updateAchievementDto.name}' already exists.`);
            }
        }

        await this.achievementRepository.update(id, updateAchievementDto);
        return await this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.findOne(id);
        await this.achievementRepository.delete(id);
    }

    async getVolunteerEarnedBadges(userId: number) {
        const volunteer = await this.volunteerRepository.findOneBy({ user_id: userId });
        if (!volunteer) {
            throw new VolunteerNotFoundException(undefined, `No volunteer profile found for user '${userId}'.`);
        }

        const earned = await this.volunteerAchievementRepository.find({
            where: { volunteer_id: volunteer.id },
            relations: ['achievement'],
            order: { obtained_at: 'DESC' },
        });

        return earned.map((va) => ({
            achievement_id: va.achievement_id,
            name: va.achievement.name,
            color: va.achievement.color,
            icon: va.achievement.icon,
            description: va.achievement.description,
            obtained_at: va.obtained_at,
        }));
    }
}
