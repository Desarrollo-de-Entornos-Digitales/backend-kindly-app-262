jest.mock('@nestjs/config', () => ({
    ConfigService: class {
        get = jest.fn();
    },
}));

jest.mock('@nestjs/passport', () => ({
    PassportStrategy: (StrategyClass: unknown, _name?: string) => {
        return class {
            constructor(..._args: unknown[]) {}
        };
    },
    AuthGuard: () => class {},
    PassportModule: class {},
}));

import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { JwtStrategy } from './jwt-strategy';
import { UserService } from '../../users/user/user.service';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../users/entities/role.entity';
import { Permission } from '../../users/entities/permission.entity';
import { RolePermission } from '../../users/entities/role-permission.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UserInactiveException } from '../../common/exceptions';

describe('JwtStrategy', () => {
    let strategy: JwtStrategy;
    let configService: {
        get: jest.Mock<(key: string) => string | undefined>;
    };
    let userService: {
        findOneWithPermissions: jest.Mock<(id: number) => Promise<User | null>>;
    };

    const createMockUser = (overrides?: Partial<User>): User => {
        const user = new User();
        user.id = 1;
        user.name = 'Juan Pérez';
        user.username = 'juanperez';
        user.email = 'juan@example.com';
        user.password = 'hashed_pw';
        user.is_active = true;
        user.role_id = 1;
        user.created_at = new Date('2026-01-01T00:00:00.000Z');
        user.announcementReaction = [];
        return Object.assign(user, overrides);
    };

    const mockPayload: JwtPayload = {
        sub: 1,
        email: 'juan@example.com',
        username: 'juanperez',
        role: 'volunteer',
    };

    beforeEach(() => {
        configService = {
            get: jest.fn<(key: string) => string | undefined>((key: string) => {
                if (key === 'JWT_SECRET') return 'custom_test_jwt_secret';
                return undefined;
            }),
        };

        userService = {
            findOneWithPermissions: jest.fn<(id: number) => Promise<User | null>>(),
        };

        strategy = new JwtStrategy(configService as unknown as ConfigService, userService as unknown as UserService);
    });

    it('should be defined', () => {
        expect(strategy).toBeDefined();
    });

    it('should fall back to default secret when JWT_SECRET is not configured', () => {
        const emptyConfigService = {
            get: jest.fn<(key: string) => string | undefined>().mockReturnValue(undefined),
        };
        const fallbackStrategy = new JwtStrategy(
            emptyConfigService as unknown as ConfigService,
            userService as unknown as UserService,
        );

        expect(fallbackStrategy).toBeDefined();
        expect(emptyConfigService.get).toHaveBeenCalledWith('JWT_SECRET');
    });

    describe('validate', () => {
        it('should validate and return user with role and flattened permissions when user is active', async () => {
            const perm1 = new Permission();
            perm1.id = 1;
            perm1.name = 'causes:read';

            const perm2 = new Permission();
            perm2.id = 2;
            perm2.name = 'causes:participate';

            const rp1 = new RolePermission();
            rp1.permission = perm1;

            const rp2 = new RolePermission();
            rp2.permission = perm2;

            const role = new Role();
            role.id = 1;
            role.name = 'volunteer';
            role.rolePermissions = [rp1, rp2];

            const mockUser = createMockUser({ id: 1, role });
            userService.findOneWithPermissions.mockResolvedValue(mockUser);

            const result = await strategy.validate(mockPayload);

            expect(userService.findOneWithPermissions).toHaveBeenCalledWith(1);
            expect(result).toEqual({
                ...mockUser,
                role: 'volunteer',
                permissions: ['causes:read', 'causes:participate'],
            });
        });

        it('should throw UnauthorizedException when user is not found in database', async () => {
            userService.findOneWithPermissions.mockResolvedValue(null);

            await expect(strategy.validate(mockPayload)).rejects.toThrow(UnauthorizedException);
            await expect(strategy.validate(mockPayload)).rejects.toThrow('User not found or token invalid');
        });

        it('should throw UserInactiveException when user account is deactivated', async () => {
            const inactiveUser = createMockUser({ id: 1, is_active: false });
            userService.findOneWithPermissions.mockResolvedValue(inactiveUser);

            await expect(strategy.validate(mockPayload)).rejects.toThrow(UserInactiveException);
            await expect(strategy.validate(mockPayload)).rejects.toThrow(
                'User account is deactivated. Please contact support.',
            );
        });

        it('should return empty permissions array when user role has no rolePermissions', async () => {
            const role = new Role();
            role.id = 2;
            role.name = 'guest';
            role.rolePermissions = [];

            const userWithoutPermissions = createMockUser({ id: 1, role });
            userService.findOneWithPermissions.mockResolvedValue(userWithoutPermissions);

            const result = await strategy.validate(mockPayload);

            expect(result.role).toBe('guest');
            expect(result.permissions).toEqual([]);
        });

        it('should return empty permissions array when user has no role assigned', async () => {
            const userWithoutRole = createMockUser({ id: 1 });
            userWithoutRole.role = undefined as unknown as Role;
            userService.findOneWithPermissions.mockResolvedValue(userWithoutRole);

            const result = await strategy.validate(mockPayload);

            expect(result.role).toBeUndefined();
            expect(result.permissions).toEqual([]);
        });

        it('should filter out undefined or null permission names in rolePermissions gracefully', async () => {
            const validPerm = new Permission();
            validPerm.id = 5;
            validPerm.name = 'announcements:read';

            const rpValid = new RolePermission();
            rpValid.permission = validPerm;

            const rpInvalid = new RolePermission();
            rpInvalid.permission = undefined as unknown as Permission;

            const role = new Role();
            role.id = 3;
            role.name = 'subscriber';
            role.rolePermissions = [rpValid, rpInvalid];

            const userWithPartialPermissions = createMockUser({ id: 1, role });
            userService.findOneWithPermissions.mockResolvedValue(userWithPartialPermissions);

            const result = await strategy.validate(mockPayload);

            expect(result.permissions).toEqual(['announcements:read']);
        });

        it('should propagate database or service error when findOneWithPermissions fails', async () => {
            userService.findOneWithPermissions.mockRejectedValue(new Error('Database query failure'));

            await expect(strategy.validate(mockPayload)).rejects.toThrow('Database query failure');
        });
    });
});
