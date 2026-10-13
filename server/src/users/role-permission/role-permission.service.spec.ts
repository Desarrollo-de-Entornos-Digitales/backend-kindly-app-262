import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DeleteResult, Repository } from 'typeorm';

import { RolePermissionService } from './role-permission.service';
import { RolePermission } from '../entities/role-permission.entity';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';

describe('RolePermissionService', () => {
    let service: RolePermissionService;

    let rolePermissionRepository: {
        find: jest.Mock<(...args: unknown[]) => Promise<RolePermission[]>>;
        findOneBy: jest.Mock<(...args: unknown[]) => Promise<RolePermission | null>>;
        create: jest.Mock<(...args: unknown[]) => RolePermission>;
        save: jest.Mock<(...args: unknown[]) => Promise<RolePermission>>;
        delete: jest.Mock<(...args: unknown[]) => Promise<DeleteResult>>;
    };

    const createMockRole = (overrides?: Partial<Role>): Role => {
        const role = new Role();
        role.id = 2;
        role.name = 'ORGANIZER';
        role.description = 'Rol para organizadores';
        role.users = [];
        role.rolePermissions = [];
        return Object.assign(role, overrides);
    };

    const createMockPermission = (overrides?: Partial<Permission>): Permission => {
        const permission = new Permission();
        permission.id = 1;
        permission.name = 'manage_causes';
        permission.description = 'Gestionar causas';
        permission.rolePermissions = [];
        return Object.assign(permission, overrides);
    };

    const createMockRolePermission = (overrides?: Partial<RolePermission>): RolePermission => {
        const rp = new RolePermission();
        rp.role_id = 2;
        rp.permission_id = 1;
        rp.role = createMockRole();
        rp.permission = createMockPermission();
        return Object.assign(rp, overrides);
    };

    beforeEach(() => {
        rolePermissionRepository = {
            find: jest.fn(() => Promise.resolve([createMockRolePermission()])),
            findOneBy: jest.fn(() => Promise.resolve(null)),
            create: jest.fn((entity: unknown) => Object.assign(new RolePermission(), entity)),
            save: jest.fn((entity: RolePermission) => Promise.resolve(entity)),
            delete: jest.fn(() => Promise.resolve({ affected: 1, raw: [] } as DeleteResult)),
        };

        service = new RolePermissionService(rolePermissionRepository as unknown as Repository<RolePermission>);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        const dto: CreateRolePermissionDto = {
            role_id: 2,
            permission_id: 1,
        };

        it('should successfully create and return a new role permission association', async () => {
            const expected = createMockRolePermission();
            rolePermissionRepository.findOneBy.mockResolvedValue(null);
            rolePermissionRepository.save.mockResolvedValue(expected);

            const result = await service.create(dto);

            expect(rolePermissionRepository.findOneBy).toHaveBeenCalledWith({
                role_id: 2,
                permission_id: 1,
            });
            expect(rolePermissionRepository.create).toHaveBeenCalledWith(dto);
            expect(rolePermissionRepository.save).toHaveBeenCalled();
            expect(result).toEqual(expected);
        });

        it('should throw ConflictException when permission is already assigned to the role', async () => {
            rolePermissionRepository.findOneBy.mockResolvedValue(createMockRolePermission());

            await expect(service.create(dto)).rejects.toThrow(ConflictException);
            await expect(service.create(dto)).rejects.toThrow(
                'This permission is already assigned to the specified role',
            );
            expect(rolePermissionRepository.create).not.toHaveBeenCalled();
            expect(rolePermissionRepository.save).not.toHaveBeenCalled();
        });

        it('should propagate repository error when findOneBy fails', async () => {
            rolePermissionRepository.findOneBy.mockRejectedValue(new Error('Database read failure'));

            await expect(service.create(dto)).rejects.toThrow('Database read failure');
        });

        it('should propagate repository error when save fails', async () => {
            rolePermissionRepository.findOneBy.mockResolvedValue(null);
            rolePermissionRepository.save.mockRejectedValue(new Error('Save constraint error'));

            await expect(service.create(dto)).rejects.toThrow('Save constraint error');
        });
    });

    describe('findAll', () => {
        it('should return all role-permission associations with role and permission relations', async () => {
            const associations = [
                createMockRolePermission({ role_id: 1, permission_id: 1 }),
                createMockRolePermission({ role_id: 2, permission_id: 2 }),
            ];
            rolePermissionRepository.find.mockResolvedValue(associations);

            const result = await service.findAll();

            expect(rolePermissionRepository.find).toHaveBeenCalledWith({
                relations: ['role', 'permission'],
            });
            expect(result).toEqual(associations);
        });

        it('should return an empty array when no associations exist', async () => {
            rolePermissionRepository.find.mockResolvedValue([]);

            const result = await service.findAll();

            expect(result).toEqual([]);
        });

        it('should propagate repository error when find fails', async () => {
            rolePermissionRepository.find.mockRejectedValue(new Error('Query execution error'));

            await expect(service.findAll()).rejects.toThrow('Query execution error');
        });
    });

    describe('findByRole', () => {
        it('should return associations for the specified role with permission relation', async () => {
            const associations = [createMockRolePermission({ role_id: 2, permission_id: 1 })];
            rolePermissionRepository.find.mockResolvedValue(associations);

            const result = await service.findByRole(2);

            expect(rolePermissionRepository.find).toHaveBeenCalledWith({
                where: { role_id: 2 },
                relations: ['permission'],
            });
            expect(result).toEqual(associations);
        });

        it('should return an empty array when role has no permissions assigned', async () => {
            rolePermissionRepository.find.mockResolvedValue([]);

            const result = await service.findByRole(99);

            expect(result).toEqual([]);
        });

        it('should propagate repository error when find fails', async () => {
            rolePermissionRepository.find.mockRejectedValue(new Error('Database search error'));

            await expect(service.findByRole(2)).rejects.toThrow('Database search error');
        });
    });

    describe('remove', () => {
        it('should delete role-permission association when found', async () => {
            rolePermissionRepository.findOneBy.mockResolvedValue(createMockRolePermission());

            await service.remove(2, 1);

            expect(rolePermissionRepository.findOneBy).toHaveBeenCalledWith({
                role_id: 2,
                permission_id: 1,
            });
            expect(rolePermissionRepository.delete).toHaveBeenCalledWith({
                role_id: 2,
                permission_id: 1,
            });
        });

        it('should throw NotFoundException when association does not exist', async () => {
            rolePermissionRepository.findOneBy.mockResolvedValue(null);

            await expect(service.remove(99, 88)).rejects.toThrow(NotFoundException);
            await expect(service.remove(99, 88)).rejects.toThrow('The role-permission association was not found');
            expect(rolePermissionRepository.delete).not.toHaveBeenCalled();
        });

        it('should propagate repository error when delete fails', async () => {
            rolePermissionRepository.findOneBy.mockResolvedValue(createMockRolePermission());
            rolePermissionRepository.delete.mockRejectedValue(new Error('Delete error'));

            await expect(service.remove(2, 1)).rejects.toThrow('Delete error');
        });
    });
});
