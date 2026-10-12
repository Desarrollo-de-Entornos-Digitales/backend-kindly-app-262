import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, ILike } from 'typeorm';

import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { RoleService } from './role/role.service';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { RoleNotFoundException, UserNotFoundException } from '../common/exceptions';

describe('UsersService', () => {
    let service: UsersService;

    let userRepository: {
        findAndCount: jest.Mock<(options?: FindManyOptions<User>) => Promise<[User[], number]>>;
        findOne: jest.Mock<(options: FindOneOptions<User>) => Promise<User | null>>;
        save: jest.Mock<(entity: User) => Promise<User>>;
    };

    let roleService: {
        findOne: jest.Mock<(id: number) => Promise<Role | null>>;
    };

    const createMockRole = (overrides?: Partial<Role>): Role => {
        const role = new Role();
        role.id = 1;
        role.name = 'volunteer';
        role.description = 'Voluntario estándar';
        role.users = [];
        role.rolePermissions = [];
        return Object.assign(role, overrides);
    };

    const createMockUser = (overrides?: Partial<User>): User => {
        const user = new User();
        user.id = 10;
        user.name = 'Carlos Santana';
        user.username = 'csantana';
        user.email = 'carlos@example.com';
        user.contact = '+573001112233';
        user.password = 'super_secret_hashed_password';
        user.is_active = true;
        user.role_id = 1;
        user.created_at = new Date('2026-01-15T08:00:00.000Z');
        user.role = createMockRole();
        user.announcementReaction = [];
        return Object.assign(user, overrides);
    };

    beforeEach(async () => {
        userRepository = {
            findAndCount: jest.fn(() => Promise.resolve([[createMockUser()], 1])),
            findOne: jest.fn((options: FindOneOptions<User>) => {
                const where = options?.where as { id?: number } | undefined;
                if (where?.id === 10) {
                    return Promise.resolve(createMockUser());
                }
                return Promise.resolve(null);
            }),
            save: jest.fn((entity: User) => Promise.resolve(entity)),
        };

        roleService = {
            findOne: jest.fn((id: number) => {
                if (id === 1 || id === 2) {
                    return Promise.resolve(
                        createMockRole({
                            id,
                            name: id === 1 ? 'volunteer' : 'admin',
                            description: id === 1 ? 'Voluntario estándar' : 'Administrador del sistema',
                        }),
                    );
                }
                return Promise.resolve(null);
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: userRepository,
                },
                {
                    provide: RoleService,
                    useValue: roleService,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return paginated and sanitized users with default page 1 and limit 10 when empty query is provided', async () => {
            const mockUsers = [
                createMockUser({ id: 10, email: 'carlos@example.com' }),
                createMockUser({ id: 11, username: 'mariap' }),
            ];
            userRepository.findAndCount.mockResolvedValue([mockUsers, 2]);

            const query: QueryUsersDto = {};
            const result = await service.findAll(query);

            expect(userRepository.findAndCount).toHaveBeenCalledWith({
                where: {},
                relations: {
                    role: {
                        rolePermissions: {
                            permission: true,
                        },
                    },
                },
                order: { created_at: 'DESC' },
                skip: 0,
                take: 10,
            });

            expect(result.data).toHaveLength(2);
            expect((result.data[0] as Partial<User>).password).toBeUndefined();
            expect((result.data[1] as Partial<User>).password).toBeUndefined();
            expect(result.data[0].email).toBe('carlos@example.com');
            expect(result.meta).toEqual({
                total: 2,
                page: 1,
                limit: 10,
                totalPages: 1,
            });
        });

        it('should calculate skip offset and totalPages correctly for custom page and limit', async () => {
            const query: QueryUsersDto = { page: 3, limit: 5 };
            userRepository.findAndCount.mockResolvedValue([[createMockUser({ id: 25 })], 14]);

            const result = await service.findAll(query);

            expect(userRepository.findAndCount).toHaveBeenCalledWith(
                expect.objectContaining({
                    skip: 10,
                    take: 5,
                }),
            );
            expect(result.meta).toEqual({
                total: 14,
                page: 3,
                limit: 5,
                totalPages: 3,
            });
        });

        it('should filter by role_id when specified in query', async () => {
            const query: QueryUsersDto = { role_id: 2 };
            userRepository.findAndCount.mockResolvedValue([[], 0]);

            await service.findAll(query);

            expect(userRepository.findAndCount).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { role_id: 2 },
                }),
            );
        });

        it('should filter by is_active boolean flag when specified in query', async () => {
            const query: QueryUsersDto = { is_active: false };
            userRepository.findAndCount.mockResolvedValue([[], 0]);

            await service.findAll(query);

            expect(userRepository.findAndCount).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { is_active: false },
                }),
            );
        });

        it('should filter by both role_id and is_active simultaneously', async () => {
            const query: QueryUsersDto = { role_id: 1, is_active: true };
            userRepository.findAndCount.mockResolvedValue([[], 0]);

            await service.findAll(query);

            expect(userRepository.findAndCount).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { role_id: 1, is_active: true },
                }),
            );
        });

        it('should apply ILike search filter across name, email and username with trimmed search term', async () => {
            const query: QueryUsersDto = { search: '  carlos  ' };
            userRepository.findAndCount.mockResolvedValue([[createMockUser()], 1]);

            await service.findAll(query);

            expect(userRepository.findAndCount).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: [{ name: ILike('%carlos%') }, { email: ILike('%carlos%') }, { username: ILike('%carlos%') }],
                }),
            );
        });

        it('should combine search filter with base filters (role_id and is_active)', async () => {
            const query: QueryUsersDto = {
                role_id: 1,
                is_active: true,
                search: 'admin',
            };
            userRepository.findAndCount.mockResolvedValue([[], 0]);

            await service.findAll(query);

            expect(userRepository.findAndCount).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: [
                        { role_id: 1, is_active: true, name: ILike('%admin%') },
                        { role_id: 1, is_active: true, email: ILike('%admin%') },
                        { role_id: 1, is_active: true, username: ILike('%admin%') },
                    ],
                }),
            );
        });

        it('should return totalPages 1 when total count is 0', async () => {
            const query: QueryUsersDto = { page: 1, limit: 10 };
            userRepository.findAndCount.mockResolvedValue([[], 0]);

            const result = await service.findAll(query);

            expect(result.meta.total).toBe(0);
            expect(result.meta.totalPages).toBe(1);
        });

        it('should propagate repository error when findAndCount fails', async () => {
            userRepository.findAndCount.mockRejectedValue(new Error('Database query failure'));

            await expect(service.findAll({})).rejects.toThrow('Database query failure');
        });
    });

    describe('findOne', () => {
        it('should return sanitized user with relations when found by id', async () => {
            const mockUser = createMockUser({ id: 10 });
            userRepository.findOne.mockResolvedValue(mockUser);

            const result = await service.findOne(10);

            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { id: 10 },
                relations: {
                    role: {
                        rolePermissions: {
                            permission: true,
                        },
                    },
                    volunteer: true,
                    organizer: true,
                },
            });

            expect((result as Partial<User>).password).toBeUndefined();
            expect(result.id).toBe(10);
            expect(result.email).toBe(mockUser.email);
            expect(result.username).toBe(mockUser.username);
        });

        it('should throw UserNotFoundException when user id does not exist', async () => {
            userRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(UserNotFoundException);
            await expect(service.findOne(999)).rejects.toThrow("User with identifier '999' not found.");
        });

        it('should propagate repository error when findOne fails', async () => {
            userRepository.findOne.mockRejectedValue(new Error('Connection failure'));

            await expect(service.findOne(10)).rejects.toThrow('Connection failure');
        });
    });

    describe('updateStatus', () => {
        const updateStatusDto: UpdateUserStatusDto = { is_active: false };

        it('should update is_active status to false and return sanitized user', async () => {
            const existingUser = createMockUser({ id: 10, is_active: true });
            userRepository.findOne.mockResolvedValue(existingUser);
            userRepository.save.mockImplementation((user: User) => Promise.resolve(user));

            const result = await service.updateStatus(10, updateStatusDto);

            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { id: 10 },
                relations: { role: true },
            });
            expect(userRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 10,
                    is_active: false,
                }),
            );
            expect(result.is_active).toBe(false);
            expect((result as Partial<User>).password).toBeUndefined();
        });

        it('should update is_active status to true when activating account', async () => {
            const existingInactiveUser = createMockUser({ id: 10, is_active: false });
            userRepository.findOne.mockResolvedValue(existingInactiveUser);
            userRepository.save.mockImplementation((user: User) => Promise.resolve(user));

            const result = await service.updateStatus(10, { is_active: true });

            expect(result.is_active).toBe(true);
            expect(userRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 10,
                    is_active: true,
                }),
            );
            expect((result as Partial<User>).password).toBeUndefined();
        });

        it('should throw UserNotFoundException when updating status of a non-existent user', async () => {
            userRepository.findOne.mockResolvedValue(null);

            await expect(service.updateStatus(999, updateStatusDto)).rejects.toThrow(UserNotFoundException);
            expect(userRepository.save).not.toHaveBeenCalled();
        });

        it('should propagate repository error when save fails during status update', async () => {
            const existingUser = createMockUser({ id: 10 });
            userRepository.findOne.mockResolvedValue(existingUser);
            userRepository.save.mockRejectedValue(new Error('Save constraint error'));

            await expect(service.updateStatus(10, updateStatusDto)).rejects.toThrow('Save constraint error');
        });
    });

    describe('assignRole', () => {
        const assignRoleDto: AssignRoleDto = { role_id: 2 };

        it('should assign new role successfully and return sanitized user', async () => {
            const existingUser = createMockUser({ id: 10, role_id: 1 });
            const newRole = createMockRole({ id: 2, name: 'admin', description: 'Administrador del sistema' });

            userRepository.findOne.mockResolvedValue(existingUser);
            roleService.findOne.mockResolvedValue(newRole);
            userRepository.save.mockImplementation((user: User) => Promise.resolve(user));

            const result = await service.assignRole(10, assignRoleDto);

            expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 10 } });
            expect(roleService.findOne).toHaveBeenCalledWith(2);
            expect(userRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 10,
                    role_id: 2,
                    role: newRole,
                }),
            );
            expect(result.role_id).toBe(2);
            expect(result.role).toEqual(newRole);
            expect((result as Partial<User>).password).toBeUndefined();
        });

        it('should throw UserNotFoundException when user id does not exist', async () => {
            userRepository.findOne.mockResolvedValue(null);

            await expect(service.assignRole(999, assignRoleDto)).rejects.toThrow(UserNotFoundException);
            expect(roleService.findOne).not.toHaveBeenCalled();
            expect(userRepository.save).not.toHaveBeenCalled();
        });

        it('should throw RoleNotFoundException when role does not exist', async () => {
            const existingUser = createMockUser({ id: 10 });
            userRepository.findOne.mockResolvedValue(existingUser);
            roleService.findOne.mockResolvedValue(null);

            await expect(service.assignRole(10, { role_id: 888 })).rejects.toThrow(RoleNotFoundException);
            await expect(service.assignRole(10, { role_id: 888 })).rejects.toThrow("Role '888' not found.");
            expect(userRepository.save).not.toHaveBeenCalled();
        });

        it('should propagate error when roleService.findOne fails', async () => {
            const existingUser = createMockUser({ id: 10 });
            userRepository.findOne.mockResolvedValue(existingUser);
            roleService.findOne.mockRejectedValue(new Error('Role service error'));

            await expect(service.assignRole(10, assignRoleDto)).rejects.toThrow('Role service error');
            expect(userRepository.save).not.toHaveBeenCalled();
        });

        it('should propagate repository error when save fails during role assignment', async () => {
            const existingUser = createMockUser({ id: 10 });
            const newRole = createMockRole({ id: 2, name: 'admin' });

            userRepository.findOne.mockResolvedValue(existingUser);
            roleService.findOne.mockResolvedValue(newRole);
            userRepository.save.mockRejectedValue(new Error('Foreign key error'));

            await expect(service.assignRole(10, assignRoleDto)).rejects.toThrow('Foreign key error');
        });
    });
});
