import { ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AchievementService } from './achievement.service';
import { Achievement } from '../entities/achievement.entity';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { AchievementNotFoundException } from '../../common/exceptions';

describe('AchievementService', () => {
    let service: AchievementService;
    let achievementRepository: jest.Mocked<Repository<Achievement>>;

    const mockAchievement: Achievement = {
        id: 1,
        name: 'Guardián del Bosque',
        description: 'Participar en jornadas de reforestación',
        color: '#2E7D32',
        icon: 'tree',
        volunteerAchievements: [],
    };

    beforeEach(() => {
        achievementRepository = {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        } as unknown as jest.Mocked<Repository<Achievement>>;

        service = new AchievementService(achievementRepository);
    });

    describe('create', () => {
        const createDto: CreateAchievementDto = {
            name: 'Guardián del Bosque',
            description: 'Participar en jornadas de reforestación',
            color: '#2E7D32',
            icon: 'tree',
        };

        it('should throw ConflictException when achievement with same name exists', async () => {
            achievementRepository.findOne.mockResolvedValue(mockAchievement);

            await expect(service.create(createDto)).rejects.toThrow(ConflictException);
        });

        it('should create and save achievement when name is unique', async () => {
            achievementRepository.findOne.mockResolvedValue(null);
            achievementRepository.create.mockReturnValue(mockAchievement);
            achievementRepository.save.mockResolvedValue(mockAchievement);

            const result = await service.create(createDto);

            expect(result).toEqual(mockAchievement);
            expect(achievementRepository.save).toHaveBeenCalled();
        });
    });

    describe('findAll', () => {
        it('should return all achievements ordered by id ascending', async () => {
            achievementRepository.find.mockResolvedValue([mockAchievement]);

            const result = await service.findAll();

            expect(result).toEqual([mockAchievement]);
            expect(achievementRepository.find).toHaveBeenCalledWith({ order: { id: 'ASC' } });
        });
    });

    describe('findOne', () => {
        it('should throw AchievementNotFoundException when achievement does not exist', async () => {
            achievementRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(AchievementNotFoundException);
        });

        it('should return the achievement when found', async () => {
            achievementRepository.findOne.mockResolvedValue(mockAchievement);

            const result = await service.findOne(1);

            expect(result).toEqual(mockAchievement);
        });
    });

    describe('findByName', () => {
        it('should return achievement by name or null if not found', async () => {
            achievementRepository.findOne.mockResolvedValue(mockAchievement);

            const result = await service.findByName('Guardián del Bosque');

            expect(result).toEqual(mockAchievement);
        });
    });

    describe('update', () => {
        const updateDto: UpdateAchievementDto = {
            name: 'Guardián del Bosque Actualizado',
        };

        it('should throw ConflictException when updating to an existing name of another achievement', async () => {
            achievementRepository.findOne
                .mockResolvedValueOnce(mockAchievement)
                .mockResolvedValueOnce({ ...mockAchievement, id: 2 });

            await expect(service.update(1, updateDto)).rejects.toThrow(ConflictException);
        });

        it('should successfully update when name is unchanged or unique', async () => {
            achievementRepository.findOne
                .mockResolvedValueOnce(mockAchievement)
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce({ ...mockAchievement, name: 'Guardián del Bosque Actualizado' });

            achievementRepository.update.mockResolvedValue({ raw: [], generatedMaps: [], affected: 1 });

            const result = await service.update(1, updateDto);

            expect(result.name).toBe('Guardián del Bosque Actualizado');
        });
    });

    describe('remove', () => {
        it('should find and delete achievement', async () => {
            achievementRepository.findOne.mockResolvedValue(mockAchievement);
            achievementRepository.delete.mockResolvedValue({ raw: [], affected: 1 });

            await service.remove(1);

            expect(achievementRepository.delete).toHaveBeenCalledWith(1);
        });
    });
});
