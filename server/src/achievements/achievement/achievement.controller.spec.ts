jest.mock('@nestjs/mapped-types', () => ({
    PartialType: (classRef: unknown) => classRef,
    OmitType: (classRef: unknown) => classRef,
    PickType: (classRef: unknown) => classRef,
    IntersectionType: (...classRefs: unknown[]) => classRefs[0],
}));

jest.mock('@nestjs/passport', () => ({
    AuthGuard: () => class {},
    PassportStrategy: () => class {},
}));

import { AchievementController } from './achievement.controller';
import { AchievementService } from './achievement.service';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { Achievement } from '../entities/achievement.entity';

describe('AchievementController', () => {
    let controller: AchievementController;
    let achievementService: {
        create: jest.Mock<Promise<Achievement>, [CreateAchievementDto]>;
        findAll: jest.Mock<Promise<Achievement[]>, []>;
        findOne: jest.Mock<Promise<Achievement>, [number]>;
        update: jest.Mock<Promise<Achievement>, [number, UpdateAchievementDto]>;
        remove: jest.Mock<Promise<void>, [number]>;
    };

    const mockAchievement: Achievement = {
        id: 1,
        title: 'Primer Voluntariado',
        description: 'Completaste tu primera causa',
        badge_image_url: 'https://img.jpg',
        created_at: new Date(),
    } as unknown as Achievement;

    beforeEach(() => {
        achievementService = {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
        };

        controller = new AchievementController(achievementService as unknown as AchievementService);
    });

    describe('create', () => {
        it('should create and return achievement', async () => {
            const dto: CreateAchievementDto = {
                name: 'Primer Voluntariado',
                color: '#FF0000',
                icon: 'star',
                description: 'Completaste tu primera causa',
            };
            achievementService.create.mockResolvedValue(mockAchievement);

            const result = await controller.create(dto);
            expect(achievementService.create).toHaveBeenCalledWith(dto);
            expect(result).toBe(mockAchievement);
        });
    });

    describe('findAll', () => {
        it('should return all achievements', async () => {
            achievementService.findAll.mockResolvedValue([mockAchievement]);

            const result = await controller.findAll();
            expect(achievementService.findAll).toHaveBeenCalled();
            expect(result).toEqual([mockAchievement]);
        });
    });

    describe('findOne', () => {
        it('should return a single achievement', async () => {
            achievementService.findOne.mockResolvedValue(mockAchievement);

            const result = await controller.findOne(1);
            expect(achievementService.findOne).toHaveBeenCalledWith(1);
            expect(result).toBe(mockAchievement);
        });
    });

    describe('update', () => {
        it('should update and return achievement', async () => {
            const dto: UpdateAchievementDto = { name: 'Nuevo Título' };
            achievementService.update.mockResolvedValue(mockAchievement);

            const result = await controller.update(1, dto);
            expect(achievementService.update).toHaveBeenCalledWith(1, dto);
            expect(result).toBe(mockAchievement);
        });
    });

    describe('remove', () => {
        it('should delete achievement', async () => {
            achievementService.remove.mockResolvedValue(undefined);

            await controller.remove(1);
            expect(achievementService.remove).toHaveBeenCalledWith(1);
        });
    });
});
