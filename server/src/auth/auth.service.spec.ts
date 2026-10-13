jest.mock('@nestjs/jwt', () => ({
    JwtService: class {
        sign = jest.fn();
    },
}));

jest.mock('bcrypt', () => ({
    compare: jest.fn(),
    hash: jest.fn(),
}));

import { describe, beforeEach, afterEach, it, expect, jest } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { UserService } from '../users/user/user.service';
import { RoleService } from '../users/role/role.service';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { CreateUserDto } from '../users/user/dto/create-user.dto';
import { InvalidCredentialsException, UserAlreadyExistsException, UserInactiveException } from '../common/exceptions';

describe('AuthService', () => {
    let service: AuthService;
    let jwtService: {
        sign: jest.Mock<(payload: JwtPayload) => string>;
    };
    let userService: {
        findByEmail: jest.Mock<(email: string) => Promise<User | null>>;
        findByEmailOrUsername: jest.Mock<(email: string, username: string) => Promise<User | null>>;
        create: jest.Mock<(createUserDto: CreateUserDto) => Promise<User>>;
    };
    let roleService: {
        findByName: jest.Mock<(name: string) => Promise<Role | null>>;
    };

    const mockBcryptCompare = bcrypt.compare as unknown as jest.Mock<(...args: unknown[]) => Promise<boolean>>;

    const createMockRole = (overrides?: Partial<Role>): Role => {
        const role = new Role();
        role.id = 1;
        role.name = 'volunteer';
        role.description = 'Volunteer role';
        role.users = [];
        role.rolePermissions = [];
        return Object.assign(role, overrides);
    };

    const createMockUser = (overrides?: Partial<User>): User => {
        const user = new User();
        user.id = 10;
        user.name = 'Jane Doe';
        user.username = 'janedoe';
        user.email = 'jane@example.com';
        user.contact = '+573001234567';
        user.password = '$2b$10$hashedpasswordstring';
        user.is_active = true;
        user.profile_picture = null;
        user.role_id = 1;
        user.role = createMockRole();
        user.created_at = new Date('2026-01-01T00:00:00.000Z');
        user.announcementReaction = [];
        return Object.assign(user, overrides);
    };

    beforeEach(async () => {
        mockBcryptCompare.mockReset();
        mockBcryptCompare.mockResolvedValue(true);

        jwtService = {
            sign: jest.fn(() => 'mocked.jwt.token'),
        };

        userService = {
            findByEmail: jest.fn(() => Promise.resolve(createMockUser())),
            findByEmailOrUsername: jest.fn(() => Promise.resolve(null)),
            create: jest.fn((dto: CreateUserDto) =>
                Promise.resolve(
                    createMockUser({
                        name: dto.name,
                        username: dto.username,
                        email: dto.email,
                        contact: dto.contact,
                        role_id: dto.roleId,
                    }),
                ),
            ),
        };

        roleService = {
            findByName: jest.fn((name: string) => Promise.resolve(createMockRole({ name }))),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: JwtService, useValue: jwtService },
                { provide: UserService, useValue: userService },
                { provide: RoleService, useValue: roleService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('validateUser', () => {
        it('should return user when credentials are valid and user is active', async () => {
            const mockUser = createMockUser();
            userService.findByEmail.mockResolvedValue(mockUser);

            const result = await service.validateUser('jane@example.com', 'correctPassword');

            expect(userService.findByEmail).toHaveBeenCalledWith('jane@example.com');
            expect(mockBcryptCompare).toHaveBeenCalledWith('correctPassword', mockUser.password);
            expect(result).toBe(mockUser);
        });

        it('should throw InvalidCredentialsException when user is not found by email', async () => {
            userService.findByEmail.mockResolvedValue(null);

            await expect(service.validateUser('unknown@example.com', 'password123')).rejects.toThrow(
                InvalidCredentialsException,
            );
            await expect(service.validateUser('unknown@example.com', 'password123')).rejects.toThrow(
                'Invalid user credentials',
            );
        });

        it('should throw InvalidCredentialsException when password does not match', async () => {
            const mockUser = createMockUser();
            userService.findByEmail.mockResolvedValue(mockUser);
            mockBcryptCompare.mockResolvedValue(false);

            await expect(service.validateUser('jane@example.com', 'wrongPassword')).rejects.toThrow(
                InvalidCredentialsException,
            );
            await expect(service.validateUser('jane@example.com', 'wrongPassword')).rejects.toThrow(
                'Invalid user credentials',
            );
        });

        it('should throw UserInactiveException when user is deactivated', async () => {
            const inactiveUser = createMockUser({ is_active: false });
            userService.findByEmail.mockResolvedValue(inactiveUser);

            await expect(service.validateUser('jane@example.com', 'correctPassword')).rejects.toThrow(
                UserInactiveException,
            );
            await expect(service.validateUser('jane@example.com', 'correctPassword')).rejects.toThrow(
                'User account is deactivated. Please contact support.',
            );
        });
    });

    describe('login', () => {
        const loginDto: LoginDto = {
            email: 'jane@example.com',
            password: 'secretPassword',
        };

        it('should return access token, message and user data upon successful login', async () => {
            const mockUser = createMockUser();
            userService.findByEmail.mockResolvedValue(mockUser);

            const result = await service.login(loginDto);

            expect(result).toEqual({
                message: 'User logged in successfully',
                access_token: 'mocked.jwt.token',
                token_type: 'Bearer',
                user: {
                    id: mockUser.id,
                    name: mockUser.name,
                    email: mockUser.email,
                    username: mockUser.username,
                    role: 'volunteer',
                },
            });
        });

        it('should construct JWT payload with sub, email, username and role', async () => {
            const mockUser = createMockUser();
            userService.findByEmail.mockResolvedValue(mockUser);

            await service.login(loginDto);

            expect(jwtService.sign).toHaveBeenCalledWith({
                sub: mockUser.id,
                email: mockUser.email,
                username: mockUser.username,
                role: 'volunteer',
            });
        });

        it('should default role to "volunteer" when user role is undefined', async () => {
            const userWithoutRole = createMockUser({ role: undefined });
            userService.findByEmail.mockResolvedValue(userWithoutRole);

            const result = await service.login(loginDto);

            expect(jwtService.sign).toHaveBeenCalledWith(
                expect.objectContaining({
                    role: 'volunteer',
                }),
            );
            expect(result.user.role).toBeUndefined();
        });

        it('should assign organizer role in JWT payload when user is organizer', async () => {
            const organizerRole = createMockRole({ id: 2, name: 'organizer' });
            const organizerUser = createMockUser({ role: organizerRole });
            userService.findByEmail.mockResolvedValue(organizerUser);

            const result = await service.login(loginDto);

            expect(jwtService.sign).toHaveBeenCalledWith(
                expect.objectContaining({
                    role: 'organizer',
                }),
            );
            expect(result.user.role).toBe('organizer');
        });

        it('should reject login when validateUser throws InvalidCredentialsException', async () => {
            userService.findByEmail.mockResolvedValue(null);

            await expect(service.login(loginDto)).rejects.toThrow(InvalidCredentialsException);
            expect(jwtService.sign).not.toHaveBeenCalled();
        });

        it('should reject login when validateUser throws UserInactiveException', async () => {
            const inactiveUser = createMockUser({ is_active: false });
            userService.findByEmail.mockResolvedValue(inactiveUser);

            await expect(service.login(loginDto)).rejects.toThrow(UserInactiveException);
            expect(jwtService.sign).not.toHaveBeenCalled();
        });
    });

    describe('register', () => {
        const volunteerDto: RegisterDto = {
            name: 'Carlos Ruiz',
            username: 'cruiz',
            email: 'cruiz@example.com',
            contact: '+573111111111',
            password: 'secretPassword123',
            role: 'volunteer',
        };

        const organizerDto: RegisterDto = {
            name: 'Fundación Huellas',
            username: 'huellasverdes',
            email: 'contacto@huellas.org',
            contact: '+573222222222',
            password: 'orgPassword123',
            role: 'organizer',
        };

        it('should successfully register a volunteer and return bearer token', async () => {
            const volunteerRole = createMockRole({ id: 1, name: 'volunteer' });
            roleService.findByName.mockResolvedValue(volunteerRole);

            const result = await service.register(volunteerDto);

            expect(userService.findByEmailOrUsername).toHaveBeenCalledWith(volunteerDto.email, volunteerDto.username);
            expect(roleService.findByName).toHaveBeenCalledWith('volunteer');
            expect(userService.create).toHaveBeenCalledWith({
                name: volunteerDto.name,
                username: volunteerDto.username,
                email: volunteerDto.email,
                contact: volunteerDto.contact,
                passwordHash: volunteerDto.password,
                roleId: 1,
                is_active: true,
            });
            expect(jwtService.sign).toHaveBeenCalledWith({
                sub: 10,
                email: volunteerDto.email,
                username: volunteerDto.username,
                role: 'volunteer',
            });
            expect(result).toEqual({
                message: 'User registered successfully',
                access_token: 'mocked.jwt.token',
                token_type: 'Bearer',
                user: {
                    id: 10,
                    name: volunteerDto.name,
                    email: volunteerDto.email,
                    username: volunteerDto.username,
                    role: 'volunteer',
                },
            });
        });

        it('should successfully register an organizer and return bearer token', async () => {
            const organizerRole = createMockRole({ id: 2, name: 'organizer' });
            roleService.findByName.mockResolvedValue(organizerRole);

            const result = await service.register(organizerDto);

            expect(roleService.findByName).toHaveBeenCalledWith('organizer');
            expect(userService.create).toHaveBeenCalledWith({
                name: organizerDto.name,
                username: organizerDto.username,
                email: organizerDto.email,
                contact: organizerDto.contact,
                passwordHash: organizerDto.password,
                roleId: 2,
                is_active: true,
            });
            expect(jwtService.sign).toHaveBeenCalledWith({
                sub: 10,
                email: organizerDto.email,
                username: organizerDto.username,
                role: 'organizer',
            });
            expect(result.user.role).toBe('organizer');
        });

        it('should pass plain password as passwordHash to delegate hashing to userService', async () => {
            const volunteerRole = createMockRole({ id: 1, name: 'volunteer' });
            roleService.findByName.mockResolvedValue(volunteerRole);

            await service.register(volunteerDto);

            expect(userService.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    passwordHash: volunteerDto.password,
                }),
            );
        });

        it('should throw BadRequestException when role is neither volunteer nor organizer', async () => {
            const invalidDto = {
                ...volunteerDto,
                role: 'admin' as unknown as 'volunteer',
            };

            await expect(service.register(invalidDto)).rejects.toThrow(BadRequestException);
            await expect(service.register(invalidDto)).rejects.toThrow('Role must be either volunteer or organizer');
            expect(userService.findByEmailOrUsername).not.toHaveBeenCalled();
            expect(userService.create).not.toHaveBeenCalled();
        });

        it('should throw UserAlreadyExistsException when email or username is already taken', async () => {
            const existingUser = createMockUser();
            userService.findByEmailOrUsername.mockResolvedValue(existingUser);

            await expect(service.register(volunteerDto)).rejects.toThrow(UserAlreadyExistsException);
            await expect(service.register(volunteerDto)).rejects.toThrow(
                'A user with this email or username already exists',
            );
            expect(roleService.findByName).not.toHaveBeenCalled();
            expect(userService.create).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when role is not found in database', async () => {
            userService.findByEmailOrUsername.mockResolvedValue(null);
            roleService.findByName.mockResolvedValue(null);

            await expect(service.register(volunteerDto)).rejects.toThrow(BadRequestException);
            await expect(service.register(volunteerDto)).rejects.toThrow(`Role ${volunteerDto.role} not found`);
            expect(userService.create).not.toHaveBeenCalled();
            expect(jwtService.sign).not.toHaveBeenCalled();
        });

        it('should propagate unexpected database errors from userService.create', async () => {
            const volunteerRole = createMockRole({ id: 1, name: 'volunteer' });
            roleService.findByName.mockResolvedValue(volunteerRole);
            userService.create.mockRejectedValue(new Error('Database connection failed'));

            await expect(service.register(volunteerDto)).rejects.toThrow('Database connection failed');
            expect(jwtService.sign).not.toHaveBeenCalled();
        });
    });
});
