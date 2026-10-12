import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DeleteResult, Repository } from 'typeorm';

import { VolunteerSkillService } from './volunteer-skill.service';
import { VolunteerSkill } from '../entities/volunteer-skill.entity';
import { Volunteer } from '../entities/volunteer.entity';
import { Skill } from '../entities/skill.entity';
import { CreateVolunteerSkillDto } from './dto/create-volunteer-skill.dto';
import { SkillNotFoundException, VolunteerNotFoundException } from '../../common/exceptions';

describe('VolunteerSkillService', () => {
    let service: VolunteerSkillService;

    let volunteerSkillRepository: {
        create: jest.Mock<(...args: unknown[]) => VolunteerSkill>;
        save: jest.Mock<(...args: unknown[]) => Promise<VolunteerSkill>>;
        find: jest.Mock<(...args: unknown[]) => Promise<VolunteerSkill[]>>;
        findOne: jest.Mock<(...args: unknown[]) => Promise<VolunteerSkill | null>>;
        findOneBy: jest.Mock<(...args: unknown[]) => Promise<VolunteerSkill | null>>;
        delete: jest.Mock<(...args: unknown[]) => Promise<DeleteResult>>;
    };

    let volunteerRepository: {
        findOneBy: jest.Mock<(...args: unknown[]) => Promise<Volunteer | null>>;
    };

    let skillRepository: {
        findOneBy: jest.Mock<(...args: unknown[]) => Promise<Skill | null>>;
    };

    const createMockVolunteer = (overrides?: Partial<Volunteer>): Volunteer => {
        const volunteer = new Volunteer();
        volunteer.id = 1;
        volunteer.user_id = 10;
        volunteer.description = 'Voluntario con habilidades técnicas';
        volunteer.shirt_size = 'L';
        volunteer.height = '1.80';
        volunteer.health_center = 'Centro Salud Norte';
        volunteer.blood_type = 'A+';
        volunteer.emergency_contact = '3119876543';
        volunteer.completed_causes = 3;
        volunteer.volunteerAchievements = [];
        volunteer.volunteerSkills = [];
        volunteer.volunteerCategories = [];
        return Object.assign(volunteer, overrides);
    };

    const createMockSkill = (overrides?: Partial<Skill>): Skill => {
        const skill = new Skill();
        skill.id = 5;
        skill.name = 'Primeros Auxilios';
        skill.description = 'Certificación en reanimación y primeros auxilios';
        skill.volunteerSkills = [];
        return Object.assign(skill, overrides);
    };

    const createMockVolunteerSkill = (overrides?: Partial<VolunteerSkill>): VolunteerSkill => {
        const vs = new VolunteerSkill();
        vs.volunteer_id = 1;
        vs.skill_id = 5;
        vs.volunteer = createMockVolunteer();
        vs.skill = createMockSkill();
        return Object.assign(vs, overrides);
    };

    beforeEach(() => {
        volunteerSkillRepository = {
            create: jest.fn((entity: unknown) => Object.assign(new VolunteerSkill(), entity)),
            save: jest.fn((entity: VolunteerSkill) => Promise.resolve(entity)),
            find: jest.fn(() => Promise.resolve([createMockVolunteerSkill()])),
            findOne: jest.fn(() => Promise.resolve(createMockVolunteerSkill())),
            findOneBy: jest.fn(() => Promise.resolve(null)),
            delete: jest.fn(() => Promise.resolve({ affected: 1, raw: [] } as DeleteResult)),
        };

        volunteerRepository = {
            findOneBy: jest.fn(() => Promise.resolve(createMockVolunteer())),
        };

        skillRepository = {
            findOneBy: jest.fn(() => Promise.resolve(createMockSkill())),
        };

        service = new VolunteerSkillService(
            volunteerSkillRepository as unknown as Repository<VolunteerSkill>,
            volunteerRepository as unknown as Repository<Volunteer>,
            skillRepository as unknown as Repository<Skill>,
        );
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        const dto: CreateVolunteerSkillDto = {
            volunteer_id: 1,
            skill_id: 5,
        };

        it('should create and return the new volunteer skill relation', async () => {
            const result = await service.create(dto);

            expect(volunteerRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
            expect(skillRepository.findOneBy).toHaveBeenCalledWith({ id: 5 });
            expect(volunteerSkillRepository.findOneBy).toHaveBeenCalledWith({
                volunteer_id: 1,
                skill_id: 5,
            });
            expect(volunteerSkillRepository.create).toHaveBeenCalledWith(dto);
            expect(volunteerSkillRepository.save).toHaveBeenCalled();
            expect(result.volunteer_id).toBe(1);
            expect(result.skill_id).toBe(5);
        });

        it('should throw VolunteerNotFoundException when volunteer does not exist', async () => {
            volunteerRepository.findOneBy.mockResolvedValue(null);

            await expect(service.create(dto)).rejects.toThrow(VolunteerNotFoundException);
            await expect(service.create(dto)).rejects.toThrow("Volunteer with identifier '1' not found.");
            expect(skillRepository.findOneBy).not.toHaveBeenCalled();
            expect(volunteerSkillRepository.save).not.toHaveBeenCalled();
        });

        it('should throw SkillNotFoundException when skill does not exist', async () => {
            skillRepository.findOneBy.mockResolvedValue(null);

            await expect(service.create(dto)).rejects.toThrow(SkillNotFoundException);
            await expect(service.create(dto)).rejects.toThrow("Skill with identifier '5' not found.");
            expect(volunteerSkillRepository.findOneBy).not.toHaveBeenCalled();
            expect(volunteerSkillRepository.save).not.toHaveBeenCalled();
        });

        it('should throw ConflictException when the skill is already assigned to the volunteer', async () => {
            volunteerSkillRepository.findOneBy.mockResolvedValue(createMockVolunteerSkill());

            await expect(service.create(dto)).rejects.toThrow(ConflictException);
            await expect(service.create(dto)).rejects.toThrow("Skill with id '5' is already assigned to volunteer '1'");
            expect(volunteerSkillRepository.create).not.toHaveBeenCalled();
            expect(volunteerSkillRepository.save).not.toHaveBeenCalled();
        });

        it('should propagate repository error when volunteer lookup fails', async () => {
            volunteerRepository.findOneBy.mockRejectedValue(new Error('Database timeout'));

            await expect(service.create(dto)).rejects.toThrow('Database timeout');
        });

        it('should propagate repository error when skill lookup fails', async () => {
            skillRepository.findOneBy.mockRejectedValue(new Error('Skill DB error'));

            await expect(service.create(dto)).rejects.toThrow('Skill DB error');
        });

        it('should propagate repository error when save fails', async () => {
            volunteerSkillRepository.save.mockRejectedValue(new Error('Save constraint error'));

            await expect(service.create(dto)).rejects.toThrow('Save constraint error');
        });
    });

    describe('findAll', () => {
        it('should return all volunteer skill relations with volunteer and skill relations when no volunteerId is provided', async () => {
            const records = [
                createMockVolunteerSkill({ volunteer_id: 1, skill_id: 5 }),
                createMockVolunteerSkill({ volunteer_id: 2, skill_id: 7 }),
            ];
            volunteerSkillRepository.find.mockResolvedValue(records);

            const result = await service.findAll();

            expect(volunteerSkillRepository.find).toHaveBeenCalledWith({
                relations: ['volunteer', 'skill'],
            });
            expect(result).toEqual(records);
        });

        it('should return skills filtered by volunteerId with skill relation when volunteerId is provided', async () => {
            const records = [createMockVolunteerSkill({ volunteer_id: 1, skill_id: 5 })];
            volunteerSkillRepository.find.mockResolvedValue(records);

            const result = await service.findAll(1);

            expect(volunteerSkillRepository.find).toHaveBeenCalledWith({
                where: { volunteer_id: 1 },
                relations: ['skill'],
            });
            expect(result).toEqual(records);
        });

        it('should return empty array when no volunteer skills are found', async () => {
            volunteerSkillRepository.find.mockResolvedValue([]);

            const result = await service.findAll(99);

            expect(result).toEqual([]);
        });

        it('should propagate repository error when find fails', async () => {
            volunteerSkillRepository.find.mockRejectedValue(new Error('Query execution failed'));

            await expect(service.findAll()).rejects.toThrow('Query execution failed');
        });
    });

    describe('findOne', () => {
        it('should return the volunteer skill relation when found', async () => {
            const expected = createMockVolunteerSkill();
            volunteerSkillRepository.findOne.mockResolvedValue(expected);

            const result = await service.findOne(1, 5);

            expect(volunteerSkillRepository.findOne).toHaveBeenCalledWith({
                where: { volunteer_id: 1, skill_id: 5 },
                relations: ['skill'],
            });
            expect(result).toEqual(expected);
        });

        it('should throw NotFoundException when relation does not exist', async () => {
            volunteerSkillRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne(1, 99)).rejects.toThrow(NotFoundException);
            await expect(service.findOne(1, 99)).rejects.toThrow(
                "Volunteer skill relation for volunteer '1' and skill '99' not found",
            );
        });

        it('should propagate repository error when findOne fails', async () => {
            volunteerSkillRepository.findOne.mockRejectedValue(new Error('Connection dropped'));

            await expect(service.findOne(1, 5)).rejects.toThrow('Connection dropped');
        });
    });

    describe('remove', () => {
        it('should remove the volunteer skill relation when found', async () => {
            const existing = createMockVolunteerSkill();
            volunteerSkillRepository.findOne.mockResolvedValue(existing);

            await service.remove(1, 5);

            expect(volunteerSkillRepository.findOne).toHaveBeenCalledWith({
                where: { volunteer_id: 1, skill_id: 5 },
                relations: ['skill'],
            });
            expect(volunteerSkillRepository.delete).toHaveBeenCalledWith({
                volunteer_id: 1,
                skill_id: 5,
            });
        });

        it('should throw NotFoundException when relation to remove does not exist', async () => {
            volunteerSkillRepository.findOne.mockResolvedValue(null);

            await expect(service.remove(1, 99)).rejects.toThrow(NotFoundException);
            expect(volunteerSkillRepository.delete).not.toHaveBeenCalled();
        });

        it('should propagate repository error when delete fails', async () => {
            const existing = createMockVolunteerSkill();
            volunteerSkillRepository.findOne.mockResolvedValue(existing);
            volunteerSkillRepository.delete.mockRejectedValue(new Error('Delete failure'));

            await expect(service.remove(1, 5)).rejects.toThrow('Delete failure');
        });
    });
});
