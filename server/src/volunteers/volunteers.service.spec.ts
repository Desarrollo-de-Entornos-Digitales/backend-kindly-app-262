import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeleteResult, UpdateResult } from 'typeorm';

import { VolunteersService } from './volunteers.service';
import { Volunteer } from './entities/volunteer.entity';
import { User } from '../users/entities/user.entity';
import { CreateVolunteerDto } from './volunteer/dto/create-volunteer.dto';
import { UpdateVolunteerDto } from './volunteer/dto/update-volunteer.dto';
import { QueryVolunteersDto } from './dto/query-volunteers.dto';
import { VolunteerNotFoundException, UserNotFoundException } from '../common/exceptions';

describe('VolunteersService', () => {
    let service: VolunteersService;

    const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn<() => Promise<[Volunteer[], number]>>(),
    };

    let volunteerRepository: {
        findOneBy: jest.Mock<(...args: unknown[]) => Promise<Volunteer | null>>;
        findOne: jest.Mock<(...args: unknown[]) => Promise<Volunteer | null>>;
        create: jest.Mock<(...args: unknown[]) => Volunteer>;
        save: jest.Mock<(...args: unknown[]) => Promise<Volunteer>>;
        update: jest.Mock<(...args: unknown[]) => Promise<UpdateResult>>;
        delete: jest.Mock<(...args: unknown[]) => Promise<DeleteResult>>;
        createQueryBuilder: jest.Mock<(...args: unknown[]) => typeof mockQueryBuilder>;
    };

    let userRepository: {
        findOneBy: jest.Mock<(...args: unknown[]) => Promise<User | null>>;
    };

    const createMockUser = (overrides?: Partial<User>): User => {
        const user = new User();
        user.id = 5;
        user.name = 'Ana Gómez';
        user.username = 'anagomez';
        user.email = 'ana@example.com';
        user.contact = '+573009876543';
        user.password = 'super_secret_user_password';
        user.is_active = true;
        user.role_id = 1;
        user.created_at = new Date('2026-01-01T00:00:00.000Z');
        user.announcementReaction = [];
        return Object.assign(user, overrides);
    };

    const createMockVolunteer = (overrides?: Partial<Volunteer>): Volunteer => {
        const vol = new Volunteer();
        vol.id = 1;
        vol.user_id = 5;
        vol.description = 'Voluntaria apasionada por el medio ambiente y reforestación';
        vol.shirt_size = 'M';
        vol.height = '165';
        vol.health_center = 'Hospital General';
        vol.blood_type = 'O+';
        vol.emergency_contact = '+573111223344';
        vol.completed_causes = 3;
        vol.user = createMockUser();
        vol.volunteerSkills = [];
        vol.volunteerCategories = [];
        vol.volunteerAchievements = [];
        vol.submissions = [];
        vol.attendances = [];
        return Object.assign(vol, overrides);
    };

    beforeEach(async () => {
        mockQueryBuilder.leftJoinAndSelect.mockClear().mockReturnThis();
        mockQueryBuilder.andWhere.mockClear().mockReturnThis();
        mockQueryBuilder.orderBy.mockClear().mockReturnThis();
        mockQueryBuilder.skip.mockClear().mockReturnThis();
        mockQueryBuilder.take.mockClear().mockReturnThis();
        mockQueryBuilder.getManyAndCount.mockReset().mockResolvedValue([[createMockVolunteer()], 1]);

        volunteerRepository = {
            findOneBy: jest.fn((where: { id?: number; user_id?: number }) => {
                if (where.id === 1 || where.user_id === 5) {
                    return Promise.resolve(createMockVolunteer());
                }
                return Promise.resolve(null);
            }),
            findOne: jest.fn((options: { where?: { id?: number; user_id?: number } }) => {
                const id = options?.where?.id;
                const userId = options?.where?.user_id;
                if (id === 1 || userId === 5) {
                    return Promise.resolve(createMockVolunteer());
                }
                return Promise.resolve(null);
            }),
            create: jest.fn((dto: CreateVolunteerDto) => createMockVolunteer(dto)),
            save: jest.fn((entity: Volunteer) => Promise.resolve(entity)),
            update: jest.fn(() => Promise.resolve({ affected: 1, raw: [], generatedMaps: [] } as UpdateResult)),
            delete: jest.fn(() => Promise.resolve({ affected: 1, raw: [] } as DeleteResult)),
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
        };

        userRepository = {
            findOneBy: jest.fn((where: { id?: number }) => {
                if (where.id === 5) return Promise.resolve(createMockUser());
                return Promise.resolve(null);
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VolunteersService,
                { provide: getRepositoryToken(Volunteer), useValue: volunteerRepository },
                { provide: getRepositoryToken(User), useValue: userRepository },
            ],
        }).compile();

        service = module.get<VolunteersService>(VolunteersService);
    });

    describe('create', () => {
        const createDto: CreateVolunteerDto = {
            user_id: 5,
            description: 'Voluntaria apasionada por el medio ambiente',
            shirt_size: 'M',
            height: '165',
            health_center: 'Hospital General',
            blood_type: 'O+',
            emergency_contact: '+573111223344',
        };

        it('should create volunteer profile successfully and return sanitized entity', async () => {
            userRepository.findOneBy.mockResolvedValue(createMockUser({ id: 5 }));
            volunteerRepository.findOneBy.mockResolvedValue(null);
            const savedVolunteer = createMockVolunteer({ id: 101, ...createDto });
            volunteerRepository.save.mockResolvedValue(savedVolunteer);
            volunteerRepository.findOne.mockResolvedValue(savedVolunteer);

            const result = await service.create(createDto);

            expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 5 });
            expect(volunteerRepository.findOneBy).toHaveBeenCalledWith({ user_id: 5 });
            expect(volunteerRepository.create).toHaveBeenCalledWith(createDto);
            expect(volunteerRepository.save).toHaveBeenCalled();
            expect(result.id).toBe(101);
            expect((result.user as Partial<User>).password).toBeUndefined();
        });

        it('should throw UserNotFoundException when the user does not exist in database', async () => {
            userRepository.findOneBy.mockResolvedValue(null);

            await expect(service.create(createDto)).rejects.toThrow(UserNotFoundException);
            expect(volunteerRepository.findOneBy).not.toHaveBeenCalled();
            expect(volunteerRepository.create).not.toHaveBeenCalled();
        });

        it('should throw ConflictException when volunteer profile already exists for the user_id', async () => {
            userRepository.findOneBy.mockResolvedValue(createMockUser({ id: 5 }));
            volunteerRepository.findOneBy.mockResolvedValue(createMockVolunteer({ user_id: 5 }));

            await expect(service.create(createDto)).rejects.toThrow(ConflictException);
            await expect(service.create(createDto)).rejects.toThrow("Volunteer profile already exists for user_id '5'");
            expect(volunteerRepository.create).not.toHaveBeenCalled();
            expect(volunteerRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('findByUserId', () => {
        it('should return the volunteer profile for the given user_id with sanitized password', async () => {
            const volunteer = createMockVolunteer({ user_id: 5 });
            volunteerRepository.findOne.mockResolvedValue(volunteer);

            const result = await service.findByUserId(5);

            expect(volunteerRepository.findOne).toHaveBeenCalledWith({
                where: { user_id: 5 },
                relations: [
                    'user',
                    'volunteerSkills.skill',
                    'volunteerCategories.category',
                    'volunteerAchievements.achievement',
                ],
            });
            expect(result.id).toBe(1);
            expect(result.user).toBeDefined();
            expect((result.user as Partial<User>).password).toBeUndefined();
        });

        it('should throw VolunteerNotFoundException when profile does not exist for the user_id', async () => {
            volunteerRepository.findOne.mockResolvedValue(null);

            await expect(service.findByUserId(999)).rejects.toThrow(VolunteerNotFoundException);
        });
    });

    describe('findOne', () => {
        it('should return the volunteer profile by id with sanitized password and all relations', async () => {
            const volunteer = createMockVolunteer({ id: 1 });
            volunteerRepository.findOne.mockResolvedValue(volunteer);

            const result = await service.findOne(1);

            expect(volunteerRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: [
                    'user',
                    'volunteerSkills.skill',
                    'volunteerCategories.category',
                    'volunteerAchievements.achievement',
                ],
            });
            expect(result.id).toBe(1);
            expect((result.user as Partial<User>).password).toBeUndefined();
        });

        it('should throw VolunteerNotFoundException when volunteer id is not found', async () => {
            volunteerRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(VolunteerNotFoundException);
        });
    });

    describe('update', () => {
        const updateDto: UpdateVolunteerDto = {
            description: 'Nueva descripción actualizada',
            shirt_size: 'L',
            user_id: 999, // Should be stripped out by service
        };

        it('should update volunteer profile and ignore user_id modification in payload', async () => {
            const existing = createMockVolunteer({ id: 1 });
            volunteerRepository.findOneBy.mockResolvedValue(existing);
            volunteerRepository.findOne.mockResolvedValue(
                createMockVolunteer({
                    ...existing,
                    description: updateDto.description ?? existing.description,
                    shirt_size: 'L',
                }),
            );

            const result = await service.update(1, updateDto);

            expect(volunteerRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
            expect(volunteerRepository.update).toHaveBeenCalledWith(1, {
                description: updateDto.description,
                shirt_size: 'L',
            });
            expect(result.description).toBe(updateDto.description);
            expect(result.shirt_size).toBe('L');
        });

        it('should throw VolunteerNotFoundException when updating a non-existent volunteer id', async () => {
            volunteerRepository.findOneBy.mockResolvedValue(null);

            await expect(service.update(999, updateDto)).rejects.toThrow(VolunteerNotFoundException);
            expect(volunteerRepository.update).not.toHaveBeenCalled();
        });
    });

    describe('updateByUserId', () => {
        const updateDto: UpdateVolunteerDto = {
            description: 'Perfil actualizado por el propio voluntario',
            emergency_contact: '+573229998877',
        };

        it('should update volunteer profile by userId and return updated sanitized profile', async () => {
            const existing = createMockVolunteer({ id: 1, user_id: 5 });
            volunteerRepository.findOneBy.mockResolvedValue(existing);
            volunteerRepository.findOne.mockResolvedValue(
                createMockVolunteer({
                    ...existing,
                    description: updateDto.description ?? existing.description,
                    emergency_contact: updateDto.emergency_contact ?? existing.emergency_contact,
                }),
            );

            const result = await service.updateByUserId(5, updateDto);

            expect(volunteerRepository.findOneBy).toHaveBeenCalledWith({ user_id: 5 });
            expect(volunteerRepository.update).toHaveBeenCalledWith(1, updateDto);
            expect(result.description).toBe(updateDto.description);
            expect(result.emergency_contact).toBe(updateDto.emergency_contact);
            expect((result.user as Partial<User>).password).toBeUndefined();
        });

        it('should throw VolunteerNotFoundException when updating profile for non-existent userId', async () => {
            volunteerRepository.findOneBy.mockResolvedValue(null);

            await expect(service.updateByUserId(999, updateDto)).rejects.toThrow(VolunteerNotFoundException);
            expect(volunteerRepository.update).not.toHaveBeenCalled();
        });
    });

    describe('remove', () => {
        it('should remove volunteer profile successfully', async () => {
            const existing = createMockVolunteer({ id: 1 });
            volunteerRepository.findOneBy.mockResolvedValue(existing);

            await service.remove(1);

            expect(volunteerRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
            expect(volunteerRepository.delete).toHaveBeenCalledWith(1);
        });

        it('should throw VolunteerNotFoundException when removing a non-existent volunteer id', async () => {
            volunteerRepository.findOneBy.mockResolvedValue(null);

            await expect(service.remove(999)).rejects.toThrow(VolunteerNotFoundException);
            expect(volunteerRepository.delete).not.toHaveBeenCalled();
        });
    });

    describe('findAll', () => {
        it('should return paginated list with default page 1 and limit 10 when query is undefined', async () => {
            const mockVol = createMockVolunteer();
            mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockVol], 1]);

            const result = await service.findAll();

            expect(volunteerRepository.createQueryBuilder).toHaveBeenCalledWith('volunteer');
            expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('volunteer.user', 'user');
            expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
                'volunteer.volunteerSkills',
                'volunteerSkills',
            );
            expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('volunteerSkills.skill', 'skill');
            expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
                'volunteer.volunteerCategories',
                'volunteerCategories',
            );
            expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('volunteerCategories.category', 'category');
            expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
                'volunteer.volunteerAchievements',
                'volunteerAchievements',
            );
            expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
                'volunteerAchievements.achievement',
                'achievement',
            );
            expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('volunteer.id', 'ASC');
            expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
            expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
            expect(result).toEqual({
                data: [mockVol],
                meta: {
                    total: 1,
                    page: 1,
                    limit: 10,
                    totalPages: 1,
                },
            });
            expect((result.data[0].user as Partial<User>).password).toBeUndefined();
        });

        it('should handle custom positive page and limit and calculate totalPages correctly', async () => {
            const query: QueryVolunteersDto = { page: 2, limit: 5 };
            mockQueryBuilder.getManyAndCount.mockResolvedValue([[createMockVolunteer()], 12]);

            const result = await service.findAll(query);

            expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5);
            expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
            expect(result.meta).toEqual({
                total: 12,
                page: 2,
                limit: 5,
                totalPages: 3,
            });
        });

        it('should fallback to page 1 and limit 10 when negative or zero numbers are provided', async () => {
            const query: QueryVolunteersDto = { page: 0, limit: -5 };
            mockQueryBuilder.getManyAndCount.mockResolvedValue([[createMockVolunteer()], 1]);

            const result = await service.findAll(query);

            expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
            expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
            expect(result.meta.page).toBe(1);
            expect(result.meta.limit).toBe(10);
        });

        it('should apply search filter across user name, username, email and volunteer description', async () => {
            const query: QueryVolunteersDto = { search: 'ana' };
            await service.findAll(query);

            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
                '(user.name ILIKE :search OR user.username ILIKE :search OR user.email ILIKE :search OR volunteer.description ILIKE :search)',
                { search: '%ana%' },
            );
        });

        it('should apply skill_id filter using EXISTS subquery', async () => {
            const query: QueryVolunteersDto = { skill_id: 4 };
            await service.findAll(query);

            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
                'EXISTS (SELECT 1 FROM volunteer_skills vs WHERE vs.volunteer_id = volunteer.id AND vs.skill_id = :skillId)',
                { skillId: 4 },
            );
        });

        it('should apply category_id filter using EXISTS subquery', async () => {
            const query: QueryVolunteersDto = { category_id: 2 };
            await service.findAll(query);

            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
                'EXISTS (SELECT 1 FROM volunteer_categories vc WHERE vc.volunteer_id = volunteer.id AND vc.category_id = :categoryId)',
                { categoryId: 2 },
            );
        });

        it('should calculate totalPages as 1 when total count is 0', async () => {
            mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

            const result = await service.findAll();

            expect(result.meta.totalPages).toBe(1);
            expect(result.meta.total).toBe(0);
        });
    });

    describe('sanitize', () => {
        it('should handle volunteer entity where user is undefined without throwing', async () => {
            const volunteerWithoutUser = createMockVolunteer({ user: undefined });
            volunteerRepository.findOne.mockResolvedValue(volunteerWithoutUser);

            const result = await service.findOne(1);

            expect(result.user).toBeUndefined();
        });
    });
});
