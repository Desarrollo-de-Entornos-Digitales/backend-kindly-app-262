jest.mock('@nestjs/passport', () => ({
    AuthGuard: () => class {},
    PassportStrategy: () => class {},
}));

import { VolunteerSkillController } from './volunteer-skill.controller';
import { VolunteerSkillService } from './volunteer-skill.service';
import { CreateVolunteerSkillDto } from './dto/create-volunteer-skill.dto';
import { VolunteerSkill } from '../entities/volunteer-skill.entity';

describe('VolunteerSkillController', () => {
    let controller: VolunteerSkillController;
    let service: jest.Mocked<VolunteerSkillService>;

    const mockRecord: VolunteerSkill = {
        volunteer_id: 1,
        skill_id: 2,
    } as VolunteerSkill;

    beforeEach(() => {
        service = {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
        } as unknown as jest.Mocked<VolunteerSkillService>;

        controller = new VolunteerSkillController(service);
    });

    describe('create', () => {
        it('should link skill to volunteer', async () => {
            const dto: CreateVolunteerSkillDto = { volunteer_id: 1, skill_id: 2 };
            service.create.mockResolvedValue(mockRecord);

            const result = await controller.create(dto);

            expect(result).toEqual(mockRecord);
            expect(service.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('findAll', () => {
        it('should return all volunteer skills with parsed ID query', async () => {
            service.findAll.mockResolvedValue([mockRecord]);

            const result = await controller.findAll('1');

            expect(result).toEqual([mockRecord]);
            expect(service.findAll).toHaveBeenCalledWith(1);
        });

        it('should return all volunteer skills without filter when query is absent', async () => {
            service.findAll.mockResolvedValue([mockRecord]);

            const result = await controller.findAll(undefined);

            expect(result).toEqual([mockRecord]);
            expect(service.findAll).toHaveBeenCalledWith(undefined);
        });
    });

    describe('findOne', () => {
        it('should return volunteer skill pair', async () => {
            service.findOne.mockResolvedValue(mockRecord);

            const result = await controller.findOne(1, 2);

            expect(result).toEqual(mockRecord);
            expect(service.findOne).toHaveBeenCalledWith(1, 2);
        });
    });

    describe('remove', () => {
        it('should unlink skill from volunteer', async () => {
            service.remove.mockResolvedValue(undefined);

            await controller.remove(1, 2);

            expect(service.remove).toHaveBeenCalledWith(1, 2);
        });
    });
});
