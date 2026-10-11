import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VolunteerAchievement } from '../entities/volunteer-achievement.entity';
import { Volunteer } from '../../volunteers/entities/volunteer.entity';
import { Achievement } from '../entities/achievement.entity';
import { CreateVolunteerAchievementDto } from './dto/create-volunteer-achievement.dto';
import { VolunteerNotFoundException, AchievementNotFoundException } from '../../common/exceptions';

@Injectable()
export class VolunteerAchievementService {
    constructor(
        @InjectRepository(VolunteerAchievement)
        private readonly volunteerAchievementRepository: Repository<VolunteerAchievement>,
        @InjectRepository(Volunteer)
        private readonly volunteerRepository: Repository<Volunteer>,
        @InjectRepository(Achievement)
        private readonly achievementRepository: Repository<Achievement>,
    ) {}

    async create(dto: CreateVolunteerAchievementDto): Promise<VolunteerAchievement> {
        const volunteer = await this.volunteerRepository.findOneBy({ id: dto.volunteer_id });
        if (!volunteer) {
            throw new VolunteerNotFoundException(dto.volunteer_id);
        }

        const achievement = await this.achievementRepository.findOneBy({ id: dto.achievement_id });
        if (!achievement) {
            throw new AchievementNotFoundException(dto.achievement_id);
        }

        const existing = await this.volunteerAchievementRepository.findOneBy({
            volunteer_id: dto.volunteer_id,
            achievement_id: dto.achievement_id,
        });

        if (existing) {
            throw new ConflictException(
                `Volunteer '${dto.volunteer_id}' already has achievement '${dto.achievement_id}'.`,
            );
        }

        const volunteerAchievement = this.volunteerAchievementRepository.create({
            volunteer_id: dto.volunteer_id,
            achievement_id: dto.achievement_id,
        });

        const saved = await this.volunteerAchievementRepository.save(volunteerAchievement);
        return await this.findOne(saved.volunteer_id, saved.achievement_id);
    }

    async findAll(): Promise<VolunteerAchievement[]> {
        return await this.volunteerAchievementRepository.find({
            relations: ['volunteer', 'achievement'],
            order: { obtained_at: 'DESC' },
        });
    }

    async findByVolunteer(volunteerId: number): Promise<VolunteerAchievement[]> {
        const volunteer = await this.volunteerRepository.findOneBy({ id: volunteerId });
        if (!volunteer) {
            throw new VolunteerNotFoundException(volunteerId);
        }

        return await this.volunteerAchievementRepository.find({
            where: { volunteer_id: volunteerId },
            relations: ['achievement'],
            order: { obtained_at: 'DESC' },
        });
    }

    async findByAchievement(achievementId: number): Promise<VolunteerAchievement[]> {
        const achievement = await this.achievementRepository.findOneBy({ id: achievementId });
        if (!achievement) {
            throw new AchievementNotFoundException(achievementId);
        }

        return await this.volunteerAchievementRepository.find({
            where: { achievement_id: achievementId },
            relations: ['volunteer', 'volunteer.user'],
            order: { obtained_at: 'DESC' },
        });
    }

    async findOne(volunteerId: number, achievementId: number): Promise<VolunteerAchievement> {
        const record = await this.volunteerAchievementRepository.findOne({
            where: { volunteer_id: volunteerId, achievement_id: achievementId },
            relations: ['volunteer', 'achievement'],
        });

        if (!record) {
            throw new NotFoundException(
                `VolunteerAchievement for volunteer '${volunteerId}' and achievement '${achievementId}' not found.`,
            );
        }

        return record;
    }

    async remove(volunteerId: number, achievementId: number): Promise<void> {
        await this.findOne(volunteerId, achievementId);
        await this.volunteerAchievementRepository.delete({
            volunteer_id: volunteerId,
            achievement_id: achievementId,
        });
    }
}
