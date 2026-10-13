jest.mock('@nestjs/passport', () => ({
    AuthGuard: () => class {},
    PassportStrategy: () => class {},
}));

import { VolunteerAchievementController } from './volunteer-achievement.controller';
import { VolunteerAchievementService } from './volunteer-achievement.service';
import { CreateVolunteerAchievementDto } from './dto/create-volunteer-achievement.dto';
import { VolunteerAchievement } from '../entities/volunteer-achievement.entity';

describe('VolunteerAchievementController', () => {
    let controller: VolunteerAchievementController;
    let service: jest.Mocked<VolunteerAchievementService>;

    const mockRecord: VolunteerAchievement = {
        volunteer_id: 1,
        achievement_id: 2,
        obtained_at: new Date(),
    } as unknown as VolunteerAchievement;

    beforeEach(() => {
        service = {
            create: jest.fn(),
            findAll: jest.fn(),
            findByVolunteer: jest.fn(),
            findByAchievement: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
        } as unknown as jest.Mocked<VolunteerAchievementService>;

        controller = new VolunteerAchievementController(service);
    });

    describe('create', () => {
        it('should award achievement to volunteer', async () => {
            const dto: CreateVolunteerAchievementDto = { volunteer_id: 1, achievement_id: 2 };
            service.create.mockResolvedValue(mockRecord);

            const result = await controller.create(dto);

            expect(result).toEqual(mockRecord);
            expect(service.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('findAll', () => {
        it('should return all volunteer achievements', async () => {
            service.findAll.mockResolvedValue([mockRecord]);

            const result = await controller.findAll();

            expect(result).toEqual([mockRecord]);
            expect(service.findAll).toHaveBeenCalled();
        });
    });

    describe('findByVolunteer', () => {
        it('should return achievements for volunteer', async () => {
            service.findByVolunteer.mockResolvedValue([mockRecord]);

            const result = await controller.findByVolunteer(1);

            expect(result).toEqual([mockRecord]);
            expect(service.findByVolunteer).toHaveBeenCalledWith(1);
        });
    });

    describe('findByAchievement', () => {
        it('should return volunteers for achievement', async () => {
            service.findByAchievement.mockResolvedValue([mockRecord]);

            const result = await controller.findByAchievement(2);

            expect(result).toEqual([mockRecord]);
            expect(service.findByAchievement).toHaveBeenCalledWith(2);
        });
    });

    describe('findOne', () => {
        it('should return single link by composite id', async () => {
            service.findOne.mockResolvedValue(mockRecord);

            const result = await controller.findOne(1, 2);

            expect(result).toEqual(mockRecord);
            expect(service.findOne).toHaveBeenCalledWith(1, 2);
        });
    });

    describe('remove', () => {
        it('should remove achievement award from volunteer', async () => {
            service.remove.mockResolvedValue(undefined);

            await controller.remove(1, 2);

            expect(service.remove).toHaveBeenCalledWith(1, 2);
        });
    });
});
