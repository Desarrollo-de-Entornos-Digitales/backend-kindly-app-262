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

jest.mock('@nestjs/config', () => ({
    ConfigService: class {},
}));

import { NotFoundException } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import { AssignRoleDto } from '../dto/assign-role.dto';
import { User } from '../entities/user.entity';

describe('UserController', () => {
    let controller: UserController;
    let userService: {
        create: jest.Mock<Promise<User>, [CreateUserDto]>;
        findAll: jest.Mock<Promise<User[]>, []>;
        findOne: jest.Mock<Promise<User | null>, [number]>;
        findOneWithPermissions: jest.Mock<Promise<User | null>, [number]>;
        findByEmail: jest.Mock<Promise<User | null>, [string]>;
        findByUsername: jest.Mock<Promise<User | null>, [string]>;
        update: jest.Mock<Promise<User | null>, [number, UpdateUserDto]>;
        updateStatus: jest.Mock<Promise<User | null>, [number, boolean]>;
        updateRole: jest.Mock<Promise<User | null>, [number, number]>;
        remove: jest.Mock<Promise<void>, [number]>;
    };

    const mockUser: User = {
        id: 1,
        name: 'Carlos Gomez',
        username: 'cgomez',
        email: 'cgomez@example.com',
        contact: '3001234567',
        passwordHash: 'hash',
        roleId: 2,
        is_active: true,
        created_at: new Date(),
    } as unknown as User;

    beforeEach(() => {
        userService = {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            findOneWithPermissions: jest.fn(),
            findByEmail: jest.fn(),
            findByUsername: jest.fn(),
            update: jest.fn(),
            updateStatus: jest.fn(),
            updateRole: jest.fn(),
            remove: jest.fn(),
        };

        controller = new UserController(userService as unknown as UserService);
    });

    describe('create', () => {
        it('should create and return a new user', async () => {
            const dto: CreateUserDto = {
                name: 'Carlos Gomez',
                username: 'cgomez',
                email: 'cgomez@example.com',
                contact: '3001234567',
                passwordHash: 'secret123',
                roleId: 2,
            };
            userService.create.mockResolvedValue(mockUser);

            const result = await controller.create(dto);
            expect(userService.create).toHaveBeenCalledWith(dto);
            expect(result).toBe(mockUser);
        });
    });

    describe('findAll', () => {
        it('should return an array of users', async () => {
            userService.findAll.mockResolvedValue([mockUser]);

            const result = await controller.findAll();
            expect(userService.findAll).toHaveBeenCalled();
            expect(result).toEqual([mockUser]);
        });
    });

    describe('findOne', () => {
        it('should return a user when found', async () => {
            userService.findOne.mockResolvedValue(mockUser);

            const result = await controller.findOne(1);
            expect(userService.findOne).toHaveBeenCalledWith(1);
            expect(result).toBe(mockUser);
        });

        it('should throw NotFoundException when user not found', async () => {
            userService.findOne.mockResolvedValue(null);

            await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('findOneWithPermissions', () => {
        it('should return a user with permissions when found', async () => {
            userService.findOneWithPermissions.mockResolvedValue(mockUser);

            const result = await controller.findOneWithPermissions(1);
            expect(userService.findOneWithPermissions).toHaveBeenCalledWith(1);
            expect(result).toBe(mockUser);
        });

        it('should throw NotFoundException when user not found', async () => {
            userService.findOneWithPermissions.mockResolvedValue(null);

            await expect(controller.findOneWithPermissions(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('findByEmail', () => {
        it('should return a user when email exists', async () => {
            userService.findByEmail.mockResolvedValue(mockUser);

            const result = await controller.findByEmail('cgomez@example.com');
            expect(userService.findByEmail).toHaveBeenCalledWith('cgomez@example.com');
            expect(result).toBe(mockUser);
        });

        it('should throw NotFoundException when email does not exist', async () => {
            userService.findByEmail.mockResolvedValue(null);

            await expect(controller.findByEmail('missing@example.com')).rejects.toThrow(NotFoundException);
        });
    });

    describe('findByUsername', () => {
        it('should return a user when username exists', async () => {
            userService.findByUsername.mockResolvedValue(mockUser);

            const result = await controller.findByUsername('cgomez');
            expect(userService.findByUsername).toHaveBeenCalledWith('cgomez');
            expect(result).toBe(mockUser);
        });

        it('should throw NotFoundException when username does not exist', async () => {
            userService.findByUsername.mockResolvedValue(null);

            await expect(controller.findByUsername('missing')).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should return updated user when found', async () => {
            const dto: UpdateUserDto = { name: 'Carlos Updated' };
            userService.update.mockResolvedValue(mockUser);

            const result = await controller.update(1, dto);
            expect(userService.update).toHaveBeenCalledWith(1, dto);
            expect(result).toBe(mockUser);
        });

        it('should throw NotFoundException when user not found', async () => {
            userService.update.mockResolvedValue(null);

            await expect(controller.update(999, {})).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateStatus', () => {
        it('should update and return user status when found', async () => {
            const dto: UpdateUserStatusDto = { is_active: false };
            userService.updateStatus.mockResolvedValue(mockUser);

            const result = await controller.updateStatus(1, dto);
            expect(userService.updateStatus).toHaveBeenCalledWith(1, false);
            expect(result).toBe(mockUser);
        });

        it('should throw NotFoundException when user not found', async () => {
            userService.updateStatus.mockResolvedValue(null);

            await expect(controller.updateStatus(999, { is_active: true })).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateRole', () => {
        it('should update and return user role when found', async () => {
            const dto: AssignRoleDto = { role_id: 3 };
            userService.updateRole.mockResolvedValue(mockUser);

            const result = await controller.updateRole(1, dto);
            expect(userService.updateRole).toHaveBeenCalledWith(1, 3);
            expect(result).toBe(mockUser);
        });

        it('should throw NotFoundException when user not found', async () => {
            userService.updateRole.mockResolvedValue(null);

            await expect(controller.updateRole(999, { role_id: 3 })).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should remove user when found', async () => {
            userService.findOne.mockResolvedValue(mockUser);
            userService.remove.mockResolvedValue(undefined);

            await controller.remove(1);
            expect(userService.findOne).toHaveBeenCalledWith(1);
            expect(userService.remove).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException when user not found', async () => {
            userService.findOne.mockResolvedValue(null);

            await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
        });
    });
});

