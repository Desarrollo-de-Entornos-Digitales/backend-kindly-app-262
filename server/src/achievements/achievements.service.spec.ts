import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeleteResult, UpdateResult } from 'typeorm';

import { AchievementsService } from './achievements.service';
import { Achievement } from './entities/achievement.entity';
import { VolunteerAchievement } from './entities/volunteer-achievement.entity';
import { Volunteer } from '../volunteers/entities/volunteer.entity';
import { CreateAchievementDto } from './achievement/dto/create-achievement.dto';
import { UpdateAchievementDto } from './achievement/dto/update-achievement.dto';
import { QueryAchievementsDto } from './dto/query-achievements.dto';
import { AchievementNotFoundException, VolunteerNotFoundException } from '../common/exceptions';

describe('AchievementsService', () => {
    let service: AchievementsService;

    const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn<() => Promise<[Achievement[], number]>>(),
    };

    let achievementRepository: {
        findOne: jest.Mock<(...args: unknown[]) => Promise<Achievement | null>>;
        create: jest.Mock<(...args: unknown[]) => Achievement>;
        save: jest.Mock<(...args: unknown[]) => Promise<Achievement>>;
        update: jest.Mock<(...args: unknown[]) => Promise<UpdateResult>>;
        delete: jest.Mock<(...args: unknown[]) => Promise<DeleteResult>>;
        createQueryBuilder: jest.Mock<(...args: unknown[]) => typeof mockQueryBuilder>;
    };

    let volunteerAchievementRepository: {
        find: jest.Mock<(...args: unknown[]) => Promise<VolunteerAchievement[]>>;
    };

    let volunteerRepository: {
        findOneBy: jest.Mock<(...args: unknown[]) => Promise<Volunteer | null>>;
    };

    const createMockAchievement = (overrides?: Partial<Achievement>): Achievement => {
        const achievement = new Achievement();
        achievement.id = 1;
        achievement.name = 'Primeros Auxilios';
        achievement.color = '#E63946';
        achievement.icon = 'fa-medkit';
        achievement.description = 'Completó exitosamente el taller certificado de primeros auxilios';
        achievement.volunteerAchievements = [];
        return Object.assign(achievement, overrides);
    };

    const createMockVolunteer = (overrides?: Partial<Volunteer>): Volunteer => {
        const volunteer = new Volunteer();
        volunteer.id = 10;
        volunteer.user_id = 5;
        volunteer.description = 'Voluntario de rescate y auxilio';
        volunteer.shirt_size = 'M';
        volunteer.height = '175';
        volunteer.health_center = 'Cruz Roja';
        volunteer.blood_type = 'O+';
        volunteer.emergency_contact = '+573001234567';
        volunteer.completed_causes = 8;
        volunteer.volunteerAchievements = [];
        return Object.assign(volunteer, overrides);
    };

    const createMockVolunteerAchievement = (overrides?: Partial<VolunteerAchievement>): VolunteerAchievement => {
        const va = new VolunteerAchievement();
        va.volunteer_id = 10;
        va.achievement_id = 1;
        va.obtained_at = new Date('2026-03-10T14:30:00.000Z');
        va.volunteer = createMockVolunteer();
        va.achievement = createMockAchievement();
        return Object.assign(va, overrides);
    };

    beforeEach(async () => {
        mockQueryBuilder.where.mockClear().mockReturnThis();
        mockQueryBuilder.orderBy.mockClear().mockReturnThis();
        mockQueryBuilder.skip.mockClear().mockReturnThis();
        mockQueryBuilder.take.mockClear().mockReturnThis();
        mockQueryBuilder.getManyAndCount.mockReset().mockResolvedValue([[createMockAchievement()], 1]);

        achievementRepository = {
            findOne: jest.fn((options: { where?: { id?: number; name?: string } }) => {
                const id = options?.where?.id;
                const name = options?.where?.name;
                if (id === 1 || name === 'Primeros Auxilios') {
                    return Promise.resolve(createMockAchievement());
                }
                return Promise.resolve(null);
            }),
            create: jest.fn((dto: CreateAchievementDto) => createMockAchievement(dto)),
            save: jest.fn((entity: Achievement) => Promise.resolve(entity)),
            update: jest.fn(() => Promise.resolve({ affected: 1, raw: [], generatedMaps: [] } as UpdateResult)),
            delete: jest.fn(() => Promise.resolve({ affected: 1, raw: [] } as DeleteResult)),
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
        };

        volunteerAchievementRepository = {
            find: jest.fn(() => Promise.resolve([createMockVolunteerAchievement()])),
        };

        volunteerRepository = {
            findOneBy: jest.fn((where: { user_id?: number }) => {
                if (where.user_id === 5) {
                    return Promise.resolve(createMockVolunteer());
                }
                return Promise.resolve(null);
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AchievementsService,
                {
                    provide: getRepositoryToken(Achievement),
                    useValue: achievementRepository,
                },
                {
                    provide: getRepositoryToken(VolunteerAchievement),
                    useValue: volunteerAchievementRepository,
                },
                {
                    provide: getRepositoryToken(Volunteer),
                    useValue: volunteerRepository,
                },
            ],
        }).compile();

        service = module.get<AchievementsService>(AchievementsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        const createDto: CreateAchievementDto = {
            name: 'Líder Comunitario',
            color: '#2A9D8F',
            icon: 'fa-users',
            description: 'Lideró más de 5 actividades comunitarias exitosas',
        };

        it('should create an achievement successfully when name does not exist', async () => {
            achievementRepository.findOne.mockResolvedValue(null);
            const createdEntity = createMockAchievement({ id: 2, ...createDto });
            achievementRepository.create.mockReturnValue(createdEntity);
            achievementRepository.save.mockResolvedValue(createdEntity);

            const result = await service.create(createDto);

            expect(achievementRepository.findOne).toHaveBeenCalledWith({
                where: { name: createDto.name },
            });
            expect(achievementRepository.create).toHaveBeenCalledWith(createDto);
            expect(achievementRepository.save).toHaveBeenCalledWith(createdEntity);
            expect(result).toEqual(createdEntity);
        });

        it('should throw ConflictException when achievement with the same name already exists', async () => {
            const existing = createMockAchievement({ name: createDto.name });
            achievementRepository.findOne.mockResolvedValue(existing);

            await expect(service.create(createDto)).rejects.toThrow(ConflictException);
            await expect(service.create(createDto)).rejects.toThrow(
                `Achievement with name '${createDto.name}' already exists.`,
            );
            expect(achievementRepository.create).not.toHaveBeenCalled();
            expect(achievementRepository.save).not.toHaveBeenCalled();
        });

        it('should propagate database error when saving achievement fails', async () => {
            achievementRepository.findOne.mockResolvedValue(null);
            achievementRepository.save.mockRejectedValue(new Error('DB Connection Timeout'));

            await expect(service.create(createDto)).rejects.toThrow('DB Connection Timeout');
        });
    });

    describe('findAll', () => {
        it('should return paginated list of achievements with default page 1 and limit 10 when query is undefined', async () => {
            const achievements = [createMockAchievement({ id: 1 }), createMockAchievement({ id: 2 })];
            mockQueryBuilder.getManyAndCount.mockResolvedValue([achievements, 2]);

            const result = await service.findAll();

            expect(achievementRepository.createQueryBuilder).toHaveBeenCalledWith('achievement');
            expect(mockQueryBuilder.where).not.toHaveBeenCalled();
            expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('achievement.id', 'ASC');
            expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
            expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
            expect(result).toEqual({
                data: achievements,
                meta: {
                    total: 2,
                    page: 1,
                    limit: 10,
                    totalPages: 1,
                },
            });
        });

        it('should apply custom page and limit and calculate totalPages correctly', async () => {
            const query: QueryAchievementsDto = { page: 3, limit: 5 };
            const achievements = [createMockAchievement({ id: 11 })];
            mockQueryBuilder.getManyAndCount.mockResolvedValue([achievements, 12]);

            const result = await service.findAll(query);

            expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
            expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
            expect(result.meta).toEqual({
                total: 12,
                page: 3,
                limit: 5,
                totalPages: 3,
            });
        });

        it('should fallback to page 1 and limit 10 when negative or non-positive values are provided', async () => {
            const query: QueryAchievementsDto = { page: -2, limit: 0 };
            mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

            const result = await service.findAll(query);

            expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
            expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
            expect(result.meta.page).toBe(1);
            expect(result.meta.limit).toBe(10);
            expect(result.meta.totalPages).toBe(1);
        });

        it('should apply search filter on name and description with trimmed value', async () => {
            const query: QueryAchievementsDto = { search: '  Auxilios  ' };
            const searchResults = [createMockAchievement({ name: 'Primeros Auxilios' })];
            mockQueryBuilder.getManyAndCount.mockResolvedValue([searchResults, 1]);

            const result = await service.findAll(query);

            expect(mockQueryBuilder.where).toHaveBeenCalledWith(
                '(achievement.name ILIKE :search OR achievement.description ILIKE :search)',
                { search: '%Auxilios%' },
            );
            expect(result.data).toEqual(searchResults);
        });

        it('should return totalPages 1 when total count is 0', async () => {
            mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

            const result = await service.findAll({ page: 1, limit: 10 });

            expect(result.meta.total).toBe(0);
            expect(result.meta.totalPages).toBe(1);
        });

        it('should propagate query builder error if getManyAndCount fails', async () => {
            mockQueryBuilder.getManyAndCount.mockRejectedValue(new Error('Query execution error'));

            await expect(service.findAll()).rejects.toThrow('Query execution error');
        });
    });

    describe('findOne', () => {
        it('should return the achievement by id when found', async () => {
            const achievement = createMockAchievement({ id: 1 });
            achievementRepository.findOne.mockResolvedValue(achievement);

            const result = await service.findOne(1);

            expect(achievementRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(result).toEqual(achievement);
        });

        it('should throw AchievementNotFoundException when id is not found', async () => {
            achievementRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(AchievementNotFoundException);
            await expect(service.findOne(999)).rejects.toThrow("Achievement with identifier '999' not found.");
        });

        it('should propagate repository error when findOne fails', async () => {
            achievementRepository.findOne.mockRejectedValue(new Error('Database read failure'));

            await expect(service.findOne(1)).rejects.toThrow('Database read failure');
        });
    });

    describe('findByName', () => {
        it('should return achievement by name when found', async () => {
            const achievement = createMockAchievement({ name: 'Primeros Auxilios' });
            achievementRepository.findOne.mockResolvedValue(achievement);

            const result = await service.findByName('Primeros Auxilios');

            expect(achievementRepository.findOne).toHaveBeenCalledWith({
                where: { name: 'Primeros Auxilios' },
            });
            expect(result).toEqual(achievement);
        });

        it('should return null when achievement with given name does not exist', async () => {
            achievementRepository.findOne.mockResolvedValue(null);

            const result = await service.findByName('Inexistente');

            expect(result).toBeNull();
        });

        it('should propagate repository error when findByName fails', async () => {
            achievementRepository.findOne.mockRejectedValue(new Error('Connection dropped'));

            await expect(service.findByName('Error')).rejects.toThrow('Connection dropped');
        });
    });

    describe('update', () => {
        const updateDto: UpdateAchievementDto = {
            description: 'Descripción actualizada con nuevo alcance',
            color: '#1D3557',
        };

        it('should update an achievement successfully without modifying name', async () => {
            const existing = createMockAchievement({ id: 1 });
            const updated = createMockAchievement({
                id: 1,
                description: updateDto.description,
                color: updateDto.color,
            });

            achievementRepository.findOne
                .mockResolvedValueOnce(existing) // findOne before update
                .mockResolvedValueOnce(updated); // findOne after update

            const result = await service.update(1, updateDto);

            expect(achievementRepository.update).toHaveBeenCalledWith(1, updateDto);
            expect(result).toEqual(updated);
        });

        it('should update an achievement successfully with a new unique name', async () => {
            const dtoWithName: UpdateAchievementDto = {
                name: 'Rescatista Certificado',
                icon: 'fa-shield-alt',
            };
            const existing = createMockAchievement({ id: 1 });
            const updated = createMockAchievement({ id: 1, ...dtoWithName });

            achievementRepository.findOne
                .mockResolvedValueOnce(existing) // findOne(id)
                .mockResolvedValueOnce(null) // findByName(name)
                .mockResolvedValueOnce(updated); // findOne(id) after update

            const result = await service.update(1, dtoWithName);

            expect(achievementRepository.update).toHaveBeenCalledWith(1, dtoWithName);
            expect(result).toEqual(updated);
        });

        it('should allow updating when name matches the existing achievement with the same id', async () => {
            const sameNameDto: UpdateAchievementDto = {
                name: 'Primeros Auxilios',
                color: '#457B9D',
            };
            const existing = createMockAchievement({ id: 1, name: 'Primeros Auxilios' });
            const updated = createMockAchievement({ id: 1, name: 'Primeros Auxilios', color: '#457B9D' });

            achievementRepository.findOne
                .mockResolvedValueOnce(existing) // findOne(id)
                .mockResolvedValueOnce(existing) // findByName(name) returns same id
                .mockResolvedValueOnce(updated); // findOne(id) after update

            const result = await service.update(1, sameNameDto);

            expect(achievementRepository.update).toHaveBeenCalledWith(1, sameNameDto);
            expect(result).toEqual(updated);
        });

        it('should throw AchievementNotFoundException when updating a non-existent achievement id', async () => {
            achievementRepository.findOne.mockResolvedValue(null);

            await expect(service.update(999, updateDto)).rejects.toThrow(AchievementNotFoundException);
            expect(achievementRepository.update).not.toHaveBeenCalled();
        });

        it('should throw ConflictException when updated name is already used by a different achievement', async () => {
            const dtoWithDuplicate: UpdateAchievementDto = {
                name: 'Nombre Duplicado',
            };
            const current = createMockAchievement({ id: 1, name: 'Original' });
            const differentExisting = createMockAchievement({ id: 2, name: 'Nombre Duplicado' });

            achievementRepository.findOne.mockImplementation((options: { where?: { id?: number; name?: string } }) => {
                if (options?.where?.id === 1) return Promise.resolve(current);
                if (options?.where?.name === 'Nombre Duplicado') return Promise.resolve(differentExisting);
                return Promise.resolve(null);
            });

            await expect(service.update(1, dtoWithDuplicate)).rejects.toThrow(ConflictException);
            await expect(service.update(1, dtoWithDuplicate)).rejects.toThrow(
                `Achievement with name '${dtoWithDuplicate.name}' already exists.`,
            );
            expect(achievementRepository.update).not.toHaveBeenCalled();
        });

        it('should propagate repository error when update operation fails', async () => {
            const existing = createMockAchievement({ id: 1 });
            achievementRepository.findOne.mockResolvedValue(existing);
            achievementRepository.update.mockRejectedValue(new Error('Update constraint error'));

            await expect(service.update(1, updateDto)).rejects.toThrow('Update constraint error');
        });
    });

    describe('remove', () => {
        it('should remove achievement successfully when it exists', async () => {
            const existing = createMockAchievement({ id: 1 });
            achievementRepository.findOne.mockResolvedValue(existing);

            await service.remove(1);

            expect(achievementRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(achievementRepository.delete).toHaveBeenCalledWith(1);
        });

        it('should throw AchievementNotFoundException when trying to remove a non-existent achievement', async () => {
            achievementRepository.findOne.mockResolvedValue(null);

            await expect(service.remove(999)).rejects.toThrow(AchievementNotFoundException);
            expect(achievementRepository.delete).not.toHaveBeenCalled();
        });

        it('should propagate repository error when delete fails', async () => {
            const existing = createMockAchievement({ id: 1 });
            achievementRepository.findOne.mockResolvedValue(existing);
            achievementRepository.delete.mockRejectedValue(new Error('Foreign key violation'));

            await expect(service.remove(1)).rejects.toThrow('Foreign key violation');
        });
    });

    describe('getVolunteerEarnedBadges', () => {
        it('should return mapped earned badges for a volunteer when profile exists', async () => {
            const volunteer = createMockVolunteer({ id: 10, user_id: 5 });
            volunteerRepository.findOneBy.mockResolvedValue(volunteer);

            const va1 = createMockVolunteerAchievement({
                volunteer_id: 10,
                achievement_id: 1,
                obtained_at: new Date('2026-03-01T10:00:00.000Z'),
                achievement: createMockAchievement({
                    id: 1,
                    name: 'Primeros Auxilios',
                    color: '#E63946',
                    icon: 'fa-medkit',
                    description: 'Taller de primeros auxilios',
                }),
            });
            const va2 = createMockVolunteerAchievement({
                volunteer_id: 10,
                achievement_id: 2,
                obtained_at: new Date('2026-02-01T10:00:00.000Z'),
                achievement: createMockAchievement({
                    id: 2,
                    name: 'Guardián del Bosque',
                    color: '#2A9D8F',
                    icon: 'fa-tree',
                    description: 'Reforestación de 50 árboles',
                }),
            });

            volunteerAchievementRepository.find.mockResolvedValue([va1, va2]);

            const badges = await service.getVolunteerEarnedBadges(5);

            expect(volunteerRepository.findOneBy).toHaveBeenCalledWith({ user_id: 5 });
            expect(volunteerAchievementRepository.find).toHaveBeenCalledWith({
                where: { volunteer_id: 10 },
                relations: ['achievement'],
                order: { obtained_at: 'DESC' },
            });
            expect(badges).toHaveLength(2);
            expect(badges[0]).toEqual({
                achievement_id: 1,
                name: 'Primeros Auxilios',
                color: '#E63946',
                icon: 'fa-medkit',
                description: 'Taller de primeros auxilios',
                obtained_at: va1.obtained_at,
            });
            expect(badges[1]).toEqual({
                achievement_id: 2,
                name: 'Guardián del Bosque',
                color: '#2A9D8F',
                icon: 'fa-tree',
                description: 'Reforestación de 50 árboles',
                obtained_at: va2.obtained_at,
            });
        });

        it('should return an empty array if the volunteer exists but has earned no badges', async () => {
            const volunteer = createMockVolunteer({ id: 10, user_id: 5 });
            volunteerRepository.findOneBy.mockResolvedValue(volunteer);
            volunteerAchievementRepository.find.mockResolvedValue([]);

            const badges = await service.getVolunteerEarnedBadges(5);

            expect(volunteerRepository.findOneBy).toHaveBeenCalledWith({ user_id: 5 });
            expect(volunteerAchievementRepository.find).toHaveBeenCalledWith({
                where: { volunteer_id: 10 },
                relations: ['achievement'],
                order: { obtained_at: 'DESC' },
            });
            expect(badges).toEqual([]);
        });

        it('should throw VolunteerNotFoundException when user has no volunteer profile', async () => {
            volunteerRepository.findOneBy.mockResolvedValue(null);

            await expect(service.getVolunteerEarnedBadges(999)).rejects.toThrow(VolunteerNotFoundException);
            expect(volunteerAchievementRepository.find).not.toHaveBeenCalled();
        });

        it('should propagate repository error when volunteerAchievementRepository.find fails', async () => {
            const volunteer = createMockVolunteer({ id: 10, user_id: 5 });
            volunteerRepository.findOneBy.mockResolvedValue(volunteer);
            volunteerAchievementRepository.find.mockRejectedValue(new Error('Database query failure'));

            await expect(service.getVolunteerEarnedBadges(5)).rejects.toThrow('Database query failure');
        });
    });
});
