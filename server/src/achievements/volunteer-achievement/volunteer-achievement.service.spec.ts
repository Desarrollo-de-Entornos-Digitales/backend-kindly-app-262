import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DeleteResult, Repository } from 'typeorm';

import { VolunteerAchievementService } from './volunteer-achievement.service';
import { VolunteerAchievement } from '../entities/volunteer-achievement.entity';
import { Volunteer } from '../../volunteers/entities/volunteer.entity';
import { Achievement } from '../entities/achievement.entity';
import { CreateVolunteerAchievementDto } from './dto/create-volunteer-achievement.dto';
import { VolunteerNotFoundException, AchievementNotFoundException } from '../../common/exceptions';

describe('VolunteerAchievementService', () => {
    let service: VolunteerAchievementService;

    let volunteerAchievementRepository: {
        create: jest.Mock<(...args: unknown[]) => VolunteerAchievement>;
        save: jest.Mock<(...args: unknown[]) => Promise<VolunteerAchievement>>;
        find: jest.Mock<(...args: unknown[]) => Promise<VolunteerAchievement[]>>;
        findOne: jest.Mock<(...args: unknown[]) => Promise<VolunteerAchievement | null>>;
        findOneBy: jest.Mock<(...args: unknown[]) => Promise<VolunteerAchievement | null>>;
        delete: jest.Mock<(...args: unknown[]) => Promise<DeleteResult>>;
    };

    let volunteerRepository: {
        findOneBy: jest.Mock<(...args: unknown[]) => Promise<Volunteer | null>>;
    };

    let achievementRepository: {
        findOneBy: jest.Mock<(...args: unknown[]) => Promise<Achievement | null>>;
    };

    const createMockVolunteer = (overrides?: Partial<Volunteer>): Volunteer => {
        const volunteer = new Volunteer();
        volunteer.id = 1;
        volunteer.user_id = 10;
        volunteer.description = 'Voluntario activo';
        volunteer.shirt_size = 'M';
        volunteer.height = '1.75';
        volunteer.health_center = 'Centro Salud Central';
        volunteer.blood_type = 'O+';
        volunteer.emergency_contact = '3001234567';
        volunteer.completed_causes = 5;
        volunteer.volunteerAchievements = [];
        volunteer.volunteerSkills = [];
        volunteer.volunteerCategories = [];
        return Object.assign(volunteer, overrides);
    };

    const createMockAchievement = (overrides?: Partial<Achievement>): Achievement => {
        const achievement = new Achievement();
        achievement.id = 3;
        achievement.name = 'Primeros Pasos';
        achievement.color = '#FFD700';
        achievement.icon = 'star';
        achievement.description = 'Completó su primera causa';
        achievement.volunteerAchievements = [];
        return Object.assign(achievement, overrides);
    };

    const createMockVolunteerAchievement = (overrides?: Partial<VolunteerAchievement>): VolunteerAchievement => {
        const va = new VolunteerAchievement();
        va.volunteer_id = 1;
        va.achievement_id = 3;
        va.obtained_at = new Date('2026-05-10T12:00:00.000Z');
        va.volunteer = createMockVolunteer();
        va.achievement = createMockAchievement();
        return Object.assign(va, overrides);
    };

    beforeEach(() => {
        volunteerAchievementRepository = {
            create: jest.fn((entity: unknown) => Object.assign(new VolunteerAchievement(), entity)),
            save: jest.fn((entity: VolunteerAchievement) => Promise.resolve(entity)),
            find: jest.fn(() => Promise.resolve([createMockVolunteerAchievement()])),
            findOne: jest.fn(() => Promise.resolve(createMockVolunteerAchievement())),
            findOneBy: jest.fn(() => Promise.resolve(null)),
            delete: jest.fn(() => Promise.resolve({ affected: 1, raw: [] } as DeleteResult)),
        };

        volunteerRepository = {
            findOneBy: jest.fn(() => Promise.resolve(createMockVolunteer())),
        };

        achievementRepository = {
            findOneBy: jest.fn(() => Promise.resolve(createMockAchievement())),
        };

        service = new VolunteerAchievementService(
            volunteerAchievementRepository as unknown as Repository<VolunteerAchievement>,
            volunteerRepository as unknown as Repository<Volunteer>,
            achievementRepository as unknown as Repository<Achievement>,
        );
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        const dto: CreateVolunteerAchievementDto = {
            volunteer_id: 1,
            achievement_id: 3,
        };

        it('should create and return the volunteer achievement record', async () => {
            const expected = createMockVolunteerAchievement();
            volunteerAchievementRepository.findOne.mockResolvedValue(expected);

            const result = await service.create(dto);

            expect(volunteerRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
            expect(achievementRepository.findOneBy).toHaveBeenCalledWith({ id: 3 });
            expect(volunteerAchievementRepository.findOneBy).toHaveBeenCalledWith({
                volunteer_id: 1,
                achievement_id: 3,
            });
            expect(volunteerAchievementRepository.create).toHaveBeenCalledWith({
                volunteer_id: 1,
                achievement_id: 3,
            });
            expect(volunteerAchievementRepository.save).toHaveBeenCalled();
            expect(volunteerAchievementRepository.findOne).toHaveBeenCalledWith({
                where: { volunteer_id: 1, achievement_id: 3 },
                relations: ['volunteer', 'achievement'],
            });
            expect(result).toEqual(expected);
        });

        it('should throw VolunteerNotFoundException when volunteer does not exist', async () => {
            volunteerRepository.findOneBy.mockResolvedValue(null);

            await expect(service.create(dto)).rejects.toThrow(VolunteerNotFoundException);
            await expect(service.create(dto)).rejects.toThrow("Volunteer with identifier '1' not found.");
            expect(achievementRepository.findOneBy).not.toHaveBeenCalled();
            expect(volunteerAchievementRepository.save).not.toHaveBeenCalled();
        });

        it('should throw AchievementNotFoundException when achievement does not exist', async () => {
            achievementRepository.findOneBy.mockResolvedValue(null);

            await expect(service.create(dto)).rejects.toThrow(AchievementNotFoundException);
            await expect(service.create(dto)).rejects.toThrow("Achievement with identifier '3' not found.");
            expect(volunteerAchievementRepository.findOneBy).not.toHaveBeenCalled();
            expect(volunteerAchievementRepository.save).not.toHaveBeenCalled();
        });

        it('should throw ConflictException when the volunteer already has the achievement', async () => {
            volunteerAchievementRepository.findOneBy.mockResolvedValue(createMockVolunteerAchievement());

            await expect(service.create(dto)).rejects.toThrow(ConflictException);
            await expect(service.create(dto)).rejects.toThrow("Volunteer '1' already has achievement '3'.");
            expect(volunteerAchievementRepository.create).not.toHaveBeenCalled();
            expect(volunteerAchievementRepository.save).not.toHaveBeenCalled();
        });

        it('should propagate repository error when volunteer check fails', async () => {
            volunteerRepository.findOneBy.mockRejectedValue(new Error('Database connection failed'));

            await expect(service.create(dto)).rejects.toThrow('Database connection failed');
        });

        it('should propagate repository error when achievement check fails', async () => {
            achievementRepository.findOneBy.mockRejectedValue(new Error('Achievement lookup failed'));

            await expect(service.create(dto)).rejects.toThrow('Achievement lookup failed');
        });

        it('should propagate repository error when save fails', async () => {
            volunteerAchievementRepository.save.mockRejectedValue(new Error('Save failed due to foreign key error'));

            await expect(service.create(dto)).rejects.toThrow('Save failed due to foreign key error');
        });
    });

    describe('findAll', () => {
        it('should return all volunteer achievements ordered by obtained_at DESC with relations', async () => {
            const records = [
                createMockVolunteerAchievement({ volunteer_id: 1, achievement_id: 1 }),
                createMockVolunteerAchievement({ volunteer_id: 2, achievement_id: 3 }),
            ];
            volunteerAchievementRepository.find.mockResolvedValue(records);

            const result = await service.findAll();

            expect(volunteerAchievementRepository.find).toHaveBeenCalledWith({
                relations: ['volunteer', 'achievement'],
                order: { obtained_at: 'DESC' },
            });
            expect(result).toEqual(records);
        });

        it('should return an empty array when no volunteer achievements exist', async () => {
            volunteerAchievementRepository.find.mockResolvedValue([]);

            const result = await service.findAll();

            expect(result).toEqual([]);
        });

        it('should propagate repository error when query fails', async () => {
            volunteerAchievementRepository.find.mockRejectedValue(new Error('Query execution error'));

            await expect(service.findAll()).rejects.toThrow('Query execution error');
        });
    });

    describe('findByVolunteer', () => {
        it('should return achievements for a specific volunteer with achievement relation', async () => {
            const records = [createMockVolunteerAchievement({ volunteer_id: 1, achievement_id: 3 })];
            volunteerAchievementRepository.find.mockResolvedValue(records);

            const result = await service.findByVolunteer(1);

            expect(volunteerRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
            expect(volunteerAchievementRepository.find).toHaveBeenCalledWith({
                where: { volunteer_id: 1 },
                relations: ['achievement'],
                order: { obtained_at: 'DESC' },
            });
            expect(result).toEqual(records);
        });

        it('should throw VolunteerNotFoundException when volunteer does not exist', async () => {
            volunteerRepository.findOneBy.mockResolvedValue(null);

            await expect(service.findByVolunteer(99)).rejects.toThrow(VolunteerNotFoundException);
            await expect(service.findByVolunteer(99)).rejects.toThrow("Volunteer with identifier '99' not found.");
            expect(volunteerAchievementRepository.find).not.toHaveBeenCalled();
        });

        it('should return an empty array when volunteer exists but has no achievements', async () => {
            volunteerAchievementRepository.find.mockResolvedValue([]);

            const result = await service.findByVolunteer(1);

            expect(result).toEqual([]);
        });

        it('should propagate repository error when find fails', async () => {
            volunteerAchievementRepository.find.mockRejectedValue(new Error('Failed fetching volunteer records'));

            await expect(service.findByVolunteer(1)).rejects.toThrow('Failed fetching volunteer records');
        });
    });

    describe('findByAchievement', () => {
        it('should return volunteer achievements for a specific achievement with volunteer and user relations', async () => {
            const records = [createMockVolunteerAchievement({ volunteer_id: 1, achievement_id: 3 })];
            volunteerAchievementRepository.find.mockResolvedValue(records);

            const result = await service.findByAchievement(3);

            expect(achievementRepository.findOneBy).toHaveBeenCalledWith({ id: 3 });
            expect(volunteerAchievementRepository.find).toHaveBeenCalledWith({
                where: { achievement_id: 3 },
                relations: ['volunteer', 'volunteer.user'],
                order: { obtained_at: 'DESC' },
            });
            expect(result).toEqual(records);
        });

        it('should throw AchievementNotFoundException when achievement does not exist', async () => {
            achievementRepository.findOneBy.mockResolvedValue(null);

            await expect(service.findByAchievement(999)).rejects.toThrow(AchievementNotFoundException);
            await expect(service.findByAchievement(999)).rejects.toThrow(
                "Achievement with identifier '999' not found.",
            );
            expect(volunteerAchievementRepository.find).not.toHaveBeenCalled();
        });

        it('should return an empty array when achievement exists but has not been obtained by any volunteer', async () => {
            volunteerAchievementRepository.find.mockResolvedValue([]);

            const result = await service.findByAchievement(3);

            expect(result).toEqual([]);
        });

        it('should propagate repository error when find fails', async () => {
            volunteerAchievementRepository.find.mockRejectedValue(new Error('Failed fetching achievement recipients'));

            await expect(service.findByAchievement(3)).rejects.toThrow('Failed fetching achievement recipients');
        });
    });

    describe('findOne', () => {
        it('should return the volunteer achievement record with relations when found', async () => {
            const expected = createMockVolunteerAchievement();
            volunteerAchievementRepository.findOne.mockResolvedValue(expected);

            const result = await service.findOne(1, 3);

            expect(volunteerAchievementRepository.findOne).toHaveBeenCalledWith({
                where: { volunteer_id: 1, achievement_id: 3 },
                relations: ['volunteer', 'achievement'],
            });
            expect(result).toEqual(expected);
        });

        it('should throw NotFoundException when the record is not found', async () => {
            volunteerAchievementRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne(1, 99)).rejects.toThrow(NotFoundException);
            await expect(service.findOne(1, 99)).rejects.toThrow(
                "VolunteerAchievement for volunteer '1' and achievement '99' not found.",
            );
        });

        it('should propagate repository error when findOne fails', async () => {
            volunteerAchievementRepository.findOne.mockRejectedValue(new Error('Database query failure'));

            await expect(service.findOne(1, 3)).rejects.toThrow('Database query failure');
        });
    });

    describe('remove', () => {
        it('should remove the volunteer achievement record when it exists', async () => {
            const existing = createMockVolunteerAchievement();
            volunteerAchievementRepository.findOne.mockResolvedValue(existing);

            await service.remove(1, 3);

            expect(volunteerAchievementRepository.findOne).toHaveBeenCalledWith({
                where: { volunteer_id: 1, achievement_id: 3 },
                relations: ['volunteer', 'achievement'],
            });
            expect(volunteerAchievementRepository.delete).toHaveBeenCalledWith({
                volunteer_id: 1,
                achievement_id: 3,
            });
        });

        it('should throw NotFoundException when the record does not exist', async () => {
            volunteerAchievementRepository.findOne.mockResolvedValue(null);

            await expect(service.remove(1, 99)).rejects.toThrow(NotFoundException);
            expect(volunteerAchievementRepository.delete).not.toHaveBeenCalled();
        });

        it('should propagate repository error when delete fails', async () => {
            const existing = createMockVolunteerAchievement();
            volunteerAchievementRepository.findOne.mockResolvedValue(existing);
            volunteerAchievementRepository.delete.mockRejectedValue(new Error('Delete execution failed'));

            await expect(service.remove(1, 3)).rejects.toThrow('Delete execution failed');
        });
    });
});
