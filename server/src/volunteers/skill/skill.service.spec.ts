import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { ConflictException } from '@nestjs/common';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';

import { SkillService } from './skill.service';
import { Skill } from '../entities/skill.entity';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { SkillNotFoundException } from '../../common/exceptions';

describe('SkillService', () => {
    let service: SkillService;

    let skillRepository: {
        find: jest.Mock<(...args: unknown[]) => Promise<Skill[]>>;
        findOneBy: jest.Mock<(...args: unknown[]) => Promise<Skill | null>>;
        create: jest.Mock<(...args: unknown[]) => Skill>;
        save: jest.Mock<(...args: unknown[]) => Promise<Skill>>;
        update: jest.Mock<(...args: unknown[]) => Promise<UpdateResult>>;
        delete: jest.Mock<(...args: unknown[]) => Promise<DeleteResult>>;
    };

    const createMockSkill = (overrides?: Partial<Skill>): Skill => {
        const skill = new Skill();
        skill.id = 1;
        skill.name = 'Primeros Auxilios';
        skill.description = 'Conocimientos básicos en atención de urgencias';
        skill.volunteerSkills = [];
        return Object.assign(skill, overrides);
    };

    beforeEach(() => {
        skillRepository = {
            find: jest.fn(() => Promise.resolve([createMockSkill()])),
            findOneBy: jest.fn(() => Promise.resolve(createMockSkill())),
            create: jest.fn((entity: unknown) => Object.assign(new Skill(), entity)),
            save: jest.fn((entity: Skill) => Promise.resolve(entity)),
            update: jest.fn(() => Promise.resolve({ affected: 1, raw: [], generatedMaps: [] } as UpdateResult)),
            delete: jest.fn(() => Promise.resolve({ affected: 1, raw: [] } as DeleteResult)),
        };

        service = new SkillService(skillRepository as unknown as Repository<Skill>);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all skills', async () => {
            const skills = [
                createMockSkill({ id: 1, name: 'Primeros Auxilios' }),
                createMockSkill({ id: 2, name: 'Logística' }),
            ];
            skillRepository.find.mockResolvedValue(skills);

            const result = await service.findAll();

            expect(skillRepository.find).toHaveBeenCalled();
            expect(result).toEqual(skills);
        });

        it('should return an empty array when no skills exist', async () => {
            skillRepository.find.mockResolvedValue([]);

            const result = await service.findAll();

            expect(result).toEqual([]);
        });

        it('should propagate repository error when find fails', async () => {
            skillRepository.find.mockRejectedValue(new Error('Database search failed'));

            await expect(service.findAll()).rejects.toThrow('Database search failed');
        });
    });

    describe('findOne', () => {
        it('should return the skill when found by id', async () => {
            const skill = createMockSkill({ id: 1, name: 'Primeros Auxilios' });
            skillRepository.findOneBy.mockResolvedValue(skill);

            const result = await service.findOne(1);

            expect(skillRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
            expect(result).toEqual(skill);
        });

        it('should throw SkillNotFoundException when skill does not exist', async () => {
            skillRepository.findOneBy.mockResolvedValue(null);

            await expect(service.findOne(99)).rejects.toThrow(SkillNotFoundException);
            await expect(service.findOne(99)).rejects.toThrow("Skill with identifier '99' not found.");
        });

        it('should propagate repository error when findOneBy fails', async () => {
            skillRepository.findOneBy.mockRejectedValue(new Error('Connection failure'));

            await expect(service.findOne(1)).rejects.toThrow('Connection failure');
        });
    });

    describe('findByName', () => {
        it('should return the skill when found by name', async () => {
            const skill = createMockSkill({ name: 'Liderazgo' });
            skillRepository.findOneBy.mockResolvedValue(skill);

            const result = await service.findByName('Liderazgo');

            expect(skillRepository.findOneBy).toHaveBeenCalledWith({ name: 'Liderazgo' });
            expect(result).toEqual(skill);
        });

        it('should return null when skill name does not exist', async () => {
            skillRepository.findOneBy.mockResolvedValue(null);

            const result = await service.findByName('Inexistente');

            expect(result).toBeNull();
        });

        it('should propagate repository error when findByName lookup fails', async () => {
            skillRepository.findOneBy.mockRejectedValue(new Error('Timeout searching skill'));

            await expect(service.findByName('Liderazgo')).rejects.toThrow('Timeout searching skill');
        });
    });

    describe('create', () => {
        const dto: CreateSkillDto = {
            name: 'Cocina Comunitaria',
            description: 'Preparación de alimentos para comedores sociales',
        };

        it('should successfully create and return a new skill', async () => {
            skillRepository.findOneBy.mockResolvedValue(null);
            const savedSkill = createMockSkill({ id: 15, ...dto });
            skillRepository.save.mockResolvedValue(savedSkill);

            const result = await service.create(dto);

            expect(skillRepository.findOneBy).toHaveBeenCalledWith({ name: 'Cocina Comunitaria' });
            expect(skillRepository.create).toHaveBeenCalledWith(dto);
            expect(skillRepository.save).toHaveBeenCalled();
            expect(result).toEqual(savedSkill);
        });

        it('should throw ConflictException when skill name already exists', async () => {
            const existing = createMockSkill({ name: 'Cocina Comunitaria' });
            skillRepository.findOneBy.mockResolvedValue(existing);

            await expect(service.create(dto)).rejects.toThrow(ConflictException);
            await expect(service.create(dto)).rejects.toThrow("Skill with name 'Cocina Comunitaria' already exists");
            expect(skillRepository.create).not.toHaveBeenCalled();
            expect(skillRepository.save).not.toHaveBeenCalled();
        });

        it('should propagate repository error when save fails', async () => {
            skillRepository.findOneBy.mockResolvedValue(null);
            skillRepository.save.mockRejectedValue(new Error('Save constraint error'));

            await expect(service.create(dto)).rejects.toThrow('Save constraint error');
        });
    });

    describe('update', () => {
        const updateDto: UpdateSkillDto = {
            name: 'Primeros Auxilios Avanzados',
            description: 'Actualización con técnicas de RCP',
        };

        it('should successfully update and return the updated skill', async () => {
            const updated = createMockSkill({ id: 1, ...updateDto });
            skillRepository.findOneBy.mockResolvedValue(updated);

            const result = await service.update(1, updateDto);

            expect(skillRepository.update).toHaveBeenCalledWith(1, updateDto);
            expect(skillRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
            expect(result).toEqual(updated);
        });

        it('should throw SkillNotFoundException when updated skill cannot be found afterwards', async () => {
            skillRepository.findOneBy.mockResolvedValue(null);

            await expect(service.update(99, updateDto)).rejects.toThrow(SkillNotFoundException);
        });

        it('should propagate repository error when update fails', async () => {
            skillRepository.update.mockRejectedValue(new Error('Update DB error'));

            await expect(service.update(1, updateDto)).rejects.toThrow('Update DB error');
        });
    });

    describe('remove', () => {
        it('should successfully delete skill when found', async () => {
            const existing = createMockSkill({ id: 1 });
            skillRepository.findOneBy.mockResolvedValue(existing);

            await service.remove(1);

            expect(skillRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
            expect(skillRepository.delete).toHaveBeenCalledWith(1);
        });

        it('should throw SkillNotFoundException when skill to delete does not exist', async () => {
            skillRepository.findOneBy.mockResolvedValue(null);

            await expect(service.remove(99)).rejects.toThrow(SkillNotFoundException);
            expect(skillRepository.delete).not.toHaveBeenCalled();
        });

        it('should propagate repository error when delete fails', async () => {
            skillRepository.findOneBy.mockResolvedValue(createMockSkill());
            skillRepository.delete.mockRejectedValue(new Error('Delete error'));

            await expect(service.remove(1)).rejects.toThrow('Delete error');
        });
    });
});
