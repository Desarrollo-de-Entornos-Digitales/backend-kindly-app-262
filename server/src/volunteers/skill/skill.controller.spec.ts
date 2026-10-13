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

import { SkillController } from './skill.controller';
import { SkillService } from './skill.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Skill } from '../entities/skill.entity';
import { SkillNotFoundException } from '../../common/exceptions';

describe('SkillController', () => {
    let controller: SkillController;
    let service: jest.Mocked<SkillService>;

    const mockSkill: Skill = {
        id: 1,
        name: 'Primeros Auxilios',
        description: 'Emergencias',
        volunteerSkills: [],
    };

    beforeEach(() => {
        service = {
            create: jest.fn(),
            findAll: jest.fn(),
            findByName: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
        } as unknown as jest.Mocked<SkillService>;

        controller = new SkillController(service);
    });

    describe('create', () => {
        it('should create a skill', async () => {
            const dto: CreateSkillDto = { name: 'Primeros Auxilios', description: 'Emergencias' };
            service.create.mockResolvedValue(mockSkill);

            const result = await controller.create(dto);

            expect(result).toEqual(mockSkill);
            expect(service.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('findAll', () => {
        it('should return all skills', async () => {
            service.findAll.mockResolvedValue([mockSkill]);

            const result = await controller.findAll();

            expect(result).toEqual([mockSkill]);
            expect(service.findAll).toHaveBeenCalled();
        });
    });

    describe('findByName', () => {
        it('should return skill when found by name', async () => {
            service.findByName.mockResolvedValue(mockSkill);

            const result = await controller.findByName('Primeros Auxilios');

            expect(result).toEqual(mockSkill);
            expect(service.findByName).toHaveBeenCalledWith('Primeros Auxilios');
        });

        it('should throw SkillNotFoundException when skill not found by name', async () => {
            service.findByName.mockResolvedValue(null);

            await expect(controller.findByName('Inexistente')).rejects.toThrow(SkillNotFoundException);
        });
    });

    describe('findOne', () => {
        it('should return skill by ID', async () => {
            service.findOne.mockResolvedValue(mockSkill);

            const result = await controller.findOne(1);

            expect(result).toEqual(mockSkill);
            expect(service.findOne).toHaveBeenCalledWith(1);
        });
    });

    describe('update', () => {
        it('should update skill by ID', async () => {
            const dto: UpdateSkillDto = { description: 'Updated' };
            service.update.mockResolvedValue({ ...mockSkill, description: 'Updated' });

            const result = await controller.update(1, dto);

            expect(result?.description).toBe('Updated');
            expect(service.update).toHaveBeenCalledWith(1, dto);
        });
    });

    describe('remove', () => {
        it('should remove skill by ID', async () => {
            service.remove.mockResolvedValue(undefined);

            await controller.remove(1);

            expect(service.remove).toHaveBeenCalledWith(1);
        });
    });
});
