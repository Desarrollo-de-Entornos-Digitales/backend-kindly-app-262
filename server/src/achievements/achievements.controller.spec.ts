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

import { AchievementsController } from './achievements.controller';
import { AchievementsService } from './achievements.service';
import { CreateAchievementDto } from './achievement/dto/create-achievement.dto';
import { UpdateAchievementDto } from './achievement/dto/update-achievement.dto';
import { QueryAchievementsDto } from './dto/query-achievements.dto';
import { Achievement } from './entities/achievement.entity';

describe('AchievementsController', () => {
    let controller: AchievementsController;
    let achievementsService: jest.Mocked<AchievementsService>;

    const mockAchievement: Achievement = {
        id: 1,
        name: 'Guardián',
        description: 'Desc',
        color: '#fff',
        icon: 'star',
        volunteerAchievements: [],
    };

    const mockEarnedBadge = {
        achievement_id: 1,
        name: 'Guardián',
        color: '#fff',
        icon: 'star',
        description: 'Desc',
        obtained_at: new Date(),
    };

    beforeEach(() => {
        achievementsService = {
            getVolunteerEarnedBadges: jest.fn(),
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
        } as unknown as jest.Mocked<AchievementsService>;

        controller = new AchievementsController(achievementsService);
    });

    describe('getMyBadges', () => {
        it('should return earned badges for authenticated volunteer sub', async () => {
            achievementsService.getVolunteerEarnedBadges.mockResolvedValue([mockEarnedBadge]);

            const result = await controller.getMyBadges({ sub: 10 });

            expect(result).toEqual([mockEarnedBadge]);
            expect(achievementsService.getVolunteerEarnedBadges).toHaveBeenCalledWith(10);
        });

        it('should fallback to user.id if user.sub is undefined', async () => {
            achievementsService.getVolunteerEarnedBadges.mockResolvedValue([mockEarnedBadge]);

            const result = await controller.getMyBadges({ id: 10 });

            expect(result).toEqual([mockEarnedBadge]);
            expect(achievementsService.getVolunteerEarnedBadges).toHaveBeenCalledWith(10);
        });
    });

    describe('create', () => {
        it('should create an achievement', async () => {
            const dto: CreateAchievementDto = { name: 'Guardián', description: 'Desc', color: '#fff', icon: 'star' };
            achievementsService.create.mockResolvedValue(mockAchievement);

            const result = await controller.create(dto);

            expect(result).toEqual(mockAchievement);
            expect(achievementsService.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('findAll', () => {
        it('should return achievements list for query', async () => {
            const query: QueryAchievementsDto = { limit: 10 };
            const paginated = { data: [mockAchievement], total: 1, limit: 10, offset: 0 };
            achievementsService.findAll.mockResolvedValue(paginated as never);

            const result = await controller.findAll(query);

            expect(result).toEqual(paginated);
            expect(achievementsService.findAll).toHaveBeenCalledWith(query);
        });
    });

    describe('findOne', () => {
        it('should return single achievement by ID', async () => {
            achievementsService.findOne.mockResolvedValue(mockAchievement);

            const result = await controller.findOne(1);

            expect(result).toEqual(mockAchievement);
            expect(achievementsService.findOne).toHaveBeenCalledWith(1);
        });
    });

    describe('update', () => {
        it('should update achievement by ID', async () => {
            const dto: UpdateAchievementDto = { name: 'Nuevo Guardián' };
            achievementsService.update.mockResolvedValue({ ...mockAchievement, name: 'Nuevo Guardián' });

            const result = await controller.update(1, dto);

            expect(result.name).toBe('Nuevo Guardián');
            expect(achievementsService.update).toHaveBeenCalledWith(1, dto);
        });
    });

    describe('remove', () => {
        it('should remove achievement by ID', async () => {
            achievementsService.remove.mockResolvedValue(undefined);

            await controller.remove(1);

            expect(achievementsService.remove).toHaveBeenCalledWith(1);
        });
    });
});
