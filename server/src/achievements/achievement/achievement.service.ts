import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement } from '../entities/achievement.entity';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { AchievementNotFoundException } from '../../common/exceptions';

@Injectable()
export class AchievementService {
    constructor(
        @InjectRepository(Achievement)
        private readonly achievementRepository: Repository<Achievement>,
    ) {}

    async create(createAchievementDto: CreateAchievementDto): Promise<Achievement> {
        const existing = await this.findByName(createAchievementDto.name);
        if (existing) {
            throw new ConflictException(`Achievement with name '${createAchievementDto.name}' already exists.`);
        }

        const achievement = this.achievementRepository.create(createAchievementDto);
        return await this.achievementRepository.save(achievement);
    }

    async findAll(): Promise<Achievement[]> {
        return await this.achievementRepository.find({
            order: { id: 'ASC' },
        });
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
}
