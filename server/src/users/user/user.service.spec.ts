jest.mock('@nestjs/config', () => ({
    ConfigService: class {
        get = jest.fn();
    },
}));

jest.mock('bcrypt', () => ({
    compare: jest.fn(),
    hash: jest.fn(),
}));

import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { UserService } from './user.service';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { RoleService } from '../role/role.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleNotFoundException, UserAlreadyExistsException, UserNotFoundException } from '../../common/exceptions';

describe('UserService', () => {
    let service: UserService;
    let userRepository: {
        create: jest.Mock<(...args: unknown[]) => User>;
        save: jest.Mock<(...args: unknown[]) => Promise<User>>;
        find: jest.Mock<(...args: unknown[]) => Promise<User[]>>;
        findOne: jest.Mock<(...args: unknown[]) => Promise<User | null>>;
        remove: jest.Mock<(...args: unknown[]) => Promise<User>>;
    };
    let roleService: {
        findOne: jest.Mock<(id: number) => Promise<Role | null>>;
    };
    let configService: {
        get: jest.Mock<(key: string) => string | undefined>;
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
        user.password = 'hashed_secure_password';
        user.is_active = true;
        user.role_id = 1;
        user.created_at = new Date('2026-01-15T08:00:00.000Z');
        user.role = createMockRole();
        user.announcementReaction = [];
        return Object.assign(user, overrides);
    };

    beforeEach(() => {
        userRepository = {
            create: jest.fn((entity: unknown) => Object.assign(new User(), entity)),
            save: jest.fn((entity: User) => Promise.resolve(entity)),
            find: jest.fn(() => Promise.resolve([createMockUser()])),
            findOne: jest.fn(() => Promise.resolve(null)),
            remove: jest.fn((entity: User) => Promise.resolve(entity)),
        };

        roleService = {
            findOne: jest.fn((id: number) => {
                if (id === 1) return Promise.resolve(createMockRole());
                return Promise.resolve(null);
            }),
        };

        configService = {
            get: jest.fn<(key: string) => string | undefined>((key: string) => {
                if (key === 'SALT_ROUNDS') return '12';
                return undefined;
            }),
        };

        (bcrypt.hash as jest.Mock).mockReset();
        (bcrypt.hash as jest.Mock).mockImplementation(() => Promise.resolve('mocked_hashed_password'));

        service = new UserService(
            userRepository as unknown as Repository<User>,
            roleService as unknown as RoleService,
            configService as unknown as ConfigService,
        );
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        const createDto: CreateUserDto = {
            name: 'Laura Gómez',
            username: 'laurag',
            email: 'laura@example.com',
            contact: '+573112223344',
            passwordHash: 'plain_password_123',
            roleId: 1,
            is_active: true,
        };

        it('should create user, hash password with configured salt rounds, and return sanitized user', async () => {
            const role = createMockRole({ id: 1 });
            roleService.findOne.mockResolvedValue(role);
            userRepository.findOne.mockResolvedValue(null);

            const savedUser = createMockUser({
                id: 20,
                name: createDto.name,
                username: createDto.username,
                email: createDto.email,
                password: 'mocked_hashed_password',
                role,
            });
            userRepository.save.mockResolvedValue(savedUser);

            const result = await service.create(createDto);

            expect(roleService.findOne).toHaveBeenCalledWith(1);
            expect(configService.get).toHaveBeenCalledWith('SALT_ROUNDS');
            expect(bcrypt.hash).toHaveBeenCalledWith('plain_password_123', 12);
            expect(userRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: createDto.name,
                    username: createDto.username,
                    email: createDto.email,
                    password: 'mocked_hashed_password',
                    role,
                }),
            );
            expect(userRepository.save).toHaveBeenCalled();
            expect((result as Partial<User>).password).toBeUndefined();
            expect(result.id).toBe(20);
        });

        it('should use default salt rounds 10 when SALT_ROUNDS is not configured', async () => {
            configService.get.mockReturnValue(undefined);
            roleService.findOne.mockResolvedValue(createMockRole({ id: 1 }));
            userRepository.findOne.mockResolvedValue(null);

            await service.create(createDto);

            expect(bcrypt.hash).toHaveBeenCalledWith('plain_password_123', 10);
        });

        it('should fallback to password property if passwordHash is undefined', async () => {
            const dtoWithRawPassword = {
                name: 'Laura Gómez',
                username: 'laurag',
                email: 'laura@example.com',
                password: 'raw_password_alt',
                roleId: 1,
            } as unknown as CreateUserDto;

            roleService.findOne.mockResolvedValue(createMockRole({ id: 1 }));
            userRepository.findOne.mockResolvedValue(null);

            await service.create(dtoWithRawPassword);

            expect(bcrypt.hash).toHaveBeenCalledWith('raw_password_alt', 12);
        });

        it('should throw RoleNotFoundException when role does not exist', async () => {
            roleService.findOne.mockResolvedValue(null);

            await expect(service.create({ ...createDto, roleId: 999 })).rejects.toThrow(RoleNotFoundException);
            expect(userRepository.save).not.toHaveBeenCalled();
            expect(bcrypt.hash).not.toHaveBeenCalled();
        });

        it('should throw UserAlreadyExistsException when email or username is already taken', async () => {
            roleService.findOne.mockResolvedValue(createMockRole({ id: 1 }));
            const existingUser = createMockUser({ email: createDto.email });
            userRepository.findOne.mockResolvedValue(existingUser);

            await expect(service.create(createDto)).rejects.toThrow(UserAlreadyExistsException);
            await expect(service.create(createDto)).rejects.toThrow('User with this email or username already exists');
            expect(bcrypt.hash).not.toHaveBeenCalled();
            expect(userRepository.save).not.toHaveBeenCalled();
        });

        it('should propagate database error when save fails', async () => {
            roleService.findOne.mockResolvedValue(createMockRole({ id: 1 }));
            userRepository.findOne.mockResolvedValue(null);
            userRepository.save.mockRejectedValue(new Error('DB Unique Constraint Error'));

            await expect(service.create(createDto)).rejects.toThrow('DB Unique Constraint Error');
        });
    });

    describe('findAll', () => {
        it('should return all users with nested role permissions', async () => {
            const users = [createMockUser({ id: 1 }), createMockUser({ id: 2 })];
            userRepository.find.mockResolvedValue(users);

            const result = await service.findAll();

            expect(userRepository.find).toHaveBeenCalledWith({
                relations: {
                    role: {
                        rolePermissions: {
                            permission: true,
                        },
                    },
                },
            });
            expect(result).toEqual(users);
        });
    });

    describe('findOne and variants', () => {
        it('should find one user by id with role relation', async () => {
            const user = createMockUser({ id: 10 });
            userRepository.findOne.mockResolvedValue(user);

            const result = await service.findOne(10);

            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { id: 10 },
                relations: ['role'],
            });
            expect(result).toEqual(user);
        });

        it('should return null when findOne does not match', async () => {
            userRepository.findOne.mockResolvedValue(null);

            const result = await service.findOne(999);

            expect(result).toBeNull();
        });

        it('should findOneWithPermissions with rolePermissions nested relations', async () => {
            const user = createMockUser({ id: 10 });
            userRepository.findOne.mockResolvedValue(user);

            const result = await service.findOneWithPermissions(10);

            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { id: 10 },
                relations: {
                    role: {
                        rolePermissions: {
                            permission: true,
                        },
                    },
                },
            });
            expect(result).toEqual(user);
        });

        it('should findByEmail with nested role permissions', async () => {
            const user = createMockUser({ email: 'carlos@example.com' });
            userRepository.findOne.mockResolvedValue(user);

            const result = await service.findByEmail('carlos@example.com');

            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { email: 'carlos@example.com' },
                relations: {
                    role: {
                        rolePermissions: {
                            permission: true,
                        },
                    },
                },
            });
            expect(result).toEqual(user);
        });

        it('should findByUsername with nested role permissions', async () => {
            const user = createMockUser({ username: 'csantana' });
            userRepository.findOne.mockResolvedValue(user);

            const result = await service.findByUsername('csantana');

            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { username: 'csantana' },
                relations: {
                    role: {
                        rolePermissions: {
                            permission: true,
                        },
                    },
                },
            });
            expect(result).toEqual(user);
        });

        it('should findByEmailOrUsername with OR condition in where clause', async () => {
            const user = createMockUser();
            userRepository.findOne.mockResolvedValue(user);

            const result = await service.findByEmailOrUsername('carlos@example.com', 'csantana');

            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: [{ email: 'carlos@example.com' }, { username: 'csantana' }],
                relations: {
                    role: {
                        rolePermissions: {
                            permission: true,
                        },
                    },
                },
            });
            expect(result).toEqual(user);
        });
    });

    describe('update', () => {
        const updateDto: UpdateUserDto = {
            name: 'Carlos Santana Actualizado',
            contact: '+573229998877',
        };

        it('should update user fields and return saved user', async () => {
            const existingUser = createMockUser({ id: 10 });
            userRepository.findOne.mockResolvedValue(existingUser);
            userRepository.save.mockImplementation((u: User) => Promise.resolve(u));

            const result = await service.update(10, updateDto);

            expect(result.name).toBe('Carlos Santana Actualizado');
            expect(result.contact).toBe('+573229998877');
            expect(userRepository.save).toHaveBeenCalled();
        });

        it('should throw UserNotFoundException when updating a non-existent user', async () => {
            userRepository.findOne.mockResolvedValue(null);

            await expect(service.update(999, updateDto)).rejects.toThrow(UserNotFoundException);
            expect(userRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('updateStatus', () => {
        it('should change is_active status to false and save', async () => {
            const existingUser = createMockUser({ id: 10, is_active: true });
            userRepository.findOne.mockResolvedValue(existingUser);
            userRepository.save.mockImplementation((u: User) => Promise.resolve(u));

            const result = await service.updateStatus(10, false);

            expect(result.is_active).toBe(false);
            expect(userRepository.save).toHaveBeenCalledWith(expect.objectContaining({ is_active: false }));
        });

        it('should throw UserNotFoundException when updating status of non-existent user', async () => {
            userRepository.findOne.mockResolvedValue(null);

            await expect(service.updateStatus(999, false)).rejects.toThrow(UserNotFoundException);
            expect(userRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('updateRole', () => {
        it('should update user role and role_id successfully', async () => {
            const existingUser = createMockUser({ id: 10, role_id: 1 });
            const newRole = createMockRole({ id: 2, name: 'admin' });

            userRepository.findOne.mockResolvedValue(existingUser);
            roleService.findOne.mockResolvedValue(newRole);
            userRepository.save.mockImplementation((u: User) => Promise.resolve(u));

            const result = await service.updateRole(10, 2);

            expect(roleService.findOne).toHaveBeenCalledWith(2);
            expect(result.role_id).toBe(2);
            expect(result.role).toEqual(newRole);
            expect(userRepository.save).toHaveBeenCalled();
        });

        it('should throw UserNotFoundException when user does not exist during role update', async () => {
            userRepository.findOne.mockResolvedValue(null);

            await expect(service.updateRole(999, 2)).rejects.toThrow(UserNotFoundException);
            expect(roleService.findOne).not.toHaveBeenCalled();
            expect(userRepository.save).not.toHaveBeenCalled();
        });

        it('should throw RoleNotFoundException when new role does not exist', async () => {
            const existingUser = createMockUser({ id: 10 });
            userRepository.findOne.mockResolvedValue(existingUser);
            roleService.findOne.mockResolvedValue(null);

            await expect(service.updateRole(10, 888)).rejects.toThrow(RoleNotFoundException);
            expect(userRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('remove', () => {
        it('should remove user when user exists', async () => {
            const existingUser = createMockUser({ id: 10 });
            userRepository.findOne.mockResolvedValue(existingUser);

            await service.remove(10);

            expect(userRepository.remove).toHaveBeenCalledWith(existingUser);
        });

        it('should throw UserNotFoundException when user does not exist', async () => {
            userRepository.findOne.mockResolvedValue(null);

            await expect(service.remove(999)).rejects.toThrow(UserNotFoundException);
            expect(userRepository.remove).not.toHaveBeenCalled();
        });
    });
});
