import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PermissionsGuard } from './permission.guard';
import { PERMISSIONS_KEY } from '../decorators/permission.decorator';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../users/entities/role.entity';
import { Permission } from '../../users/entities/permission.entity';
import { RolePermission } from '../../users/entities/role-permission.entity';

describe('PermissionsGuard', () => {
    let guard: PermissionsGuard;
    let reflector: {
        getAllAndOverride: jest.Mock<(metadataKey: string, targets: unknown[]) => string[] | undefined>;
    };

    const createMockExecutionContext = (user?: unknown): ExecutionContext => {
        return {
            getHandler: jest.fn(),
            getClass: jest.fn(),
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue({ user }),
                getResponse: jest.fn(),
                getNext: jest.fn(),
            }),
        } as unknown as ExecutionContext;
    };

    beforeEach(() => {
        reflector = {
            getAllAndOverride: jest.fn<(metadataKey: string, targets: unknown[]) => string[] | undefined>(),
        };
        guard = new PermissionsGuard(reflector as unknown as Reflector);
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    it('should allow access when no permissions metadata is defined on handler or class', () => {
        reflector.getAllAndOverride.mockReturnValue(undefined);
        const context = createMockExecutionContext();

        const result = guard.canActivate(context);

        expect(result).toBe(true);
        expect(reflector.getAllAndOverride).toHaveBeenCalledWith(PERMISSIONS_KEY, expect.any(Array));
    });

    it('should allow access when required permissions array is empty', () => {
        reflector.getAllAndOverride.mockReturnValue([]);
        const context = createMockExecutionContext();

        const result = guard.canActivate(context);

        expect(result).toBe(true);
    });

    it('should throw UnauthorizedException when permissions are required but user is not in request', () => {
        reflector.getAllAndOverride.mockReturnValue(['causes:create']);
        const context = createMockExecutionContext(undefined);

        expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
        expect(() => guard.canActivate(context)).toThrow('User is not authenticated');
    });

    it('should allow access immediately when user role is string admin regardless of explicit permissions', () => {
        reflector.getAllAndOverride.mockReturnValue(['causes:delete', 'users:manage']);
        const user = {
            id: 1,
            role: 'admin',
        };
        const context = createMockExecutionContext(user);

        const result = guard.canActivate(context);

        expect(result).toBe(true);
    });

    it('should allow access immediately when user has a role object with name admin', () => {
        reflector.getAllAndOverride.mockReturnValue(['system:configure']);
        const role = new Role();
        role.id = 1;
        role.name = 'admin';

        const user = {
            id: 2,
            role,
        };
        const context = createMockExecutionContext(user);

        const result = guard.canActivate(context);

        expect(result).toBe(true);
    });

    it('should allow access when user has direct permissions array containing all required permissions', () => {
        reflector.getAllAndOverride.mockReturnValue(['causes:read', 'causes:create']);
        const user = {
            id: 10,
            role: { name: 'organizer' },
            permissions: ['causes:read', 'causes:create', 'causes:update'],
        };
        const context = createMockExecutionContext(user);

        const result = guard.canActivate(context);

        expect(result).toBe(true);
    });

    it('should allow access when user role contains rolePermissions matching all required permissions', () => {
        reflector.getAllAndOverride.mockReturnValue(['volunteers:read']);

        const perm = new Permission();
        perm.id = 1;
        perm.name = 'volunteers:read';

        const rp = new RolePermission();
        rp.permission = perm;

        const role = new Role();
        role.id = 3;
        role.name = 'coordinator';
        role.rolePermissions = [rp];

        const user = {
            id: 15,
            role,
        };
        const context = createMockExecutionContext(user);

        const result = guard.canActivate(context);

        expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user lacks one of the required permissions', () => {
        reflector.getAllAndOverride.mockReturnValue(['causes:create', 'causes:publish']);
        const user = {
            id: 20,
            role: { name: 'volunteer' },
            permissions: ['causes:create'],
        };
        const context = createMockExecutionContext(user);

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
        expect(() => guard.canActivate(context)).toThrow(
            'Access denied: You do not have the required permissions [causes:create, causes:publish]',
        );
    });

    it('should throw ForbiddenException when user has no permissions and no rolePermissions', () => {
        reflector.getAllAndOverride.mockReturnValue(['admin:audit']);
        const user = {
            id: 25,
            role: { name: 'guest' },
        };
        const context = createMockExecutionContext(user);

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should filter out malformed or null entries in rolePermissions without throwing runtime errors', () => {
        reflector.getAllAndOverride.mockReturnValue(['causes:view']);

        const malformedRp = new RolePermission();
        malformedRp.permission = undefined as unknown as Permission;

        const validPerm = new Permission();
        validPerm.id = 2;
        validPerm.name = 'causes:view';

        const validRp = new RolePermission();
        validRp.permission = validPerm;

        const role = new Role();
        role.id = 4;
        role.name = 'viewer';
        role.rolePermissions = [malformedRp, validRp];

        const user = {
            id: 30,
            role,
        };
        const context = createMockExecutionContext(user);

        const result = guard.canActivate(context);

        expect(result).toBe(true);
    });
});
