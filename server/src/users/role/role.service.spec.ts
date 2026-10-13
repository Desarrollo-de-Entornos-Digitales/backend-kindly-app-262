import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';

import { RoleService } from './role.service';
import { Role } from '../entities/role.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { Permission } from '../entities/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

describe('RoleService', () => {
    let service: RoleService;

    let roleRepository: {
        find: jest.Mock<(...args: unknown[]) => Promise<Role[]>>;
        findOne: jest.Mock<(...args: unknown[]) => Promise<Role | null>>;
        create: jest.Mock<(...args: unknown[]) => Role>;
        save: jest.Mock<(...args: unknown[]) => Promise<Role>>;
        update: jest.Mock<(...args: unknown[]) => Promise<UpdateResult>>;
        delete: jest.Mock<(...args: unknown[]) => Promise<DeleteResult>>;
    };

    const createMockPermission = (overrides?: Partial<Permission>): Permission => {
        const permission = new Permission();
        permission.id = 1;
        permission.name = 'manage_causes';
        permission.description = 'Permiso para crear y gestionar causas';
        permission.rolePermissions = [];
        return Object.assign(permission, overrides);
    };

    const createMockRolePermission = (overrides?: Partial<RolePermission>): RolePermission => {
        const rp = new RolePermission();
        rp.role_id = 2;
        rp.permission_id = 1;
        rp.permission = createMockPermission();
        return Object.assign(rp, overrides);
    };

    const createMockRole = (overrides?: Partial<Role>): Role => {
        const role = new Role();
        role.id = 2;
        role.name = 'ORGANIZER';
        role.description = 'Rol para organizaciones y líderes de causas';
        role.users = [];
        role.rolePermissions = [createMockRolePermission()];
        return Object.assign(role, overrides);
    };

    beforeEach(() => {
        roleRepository = {
            find: jest.fn(() => Promise.resolve([createMockRole()])),
            findOne: jest.fn(() => Promise.resolve(createMockRole())),
            create: jest.fn((entity: unknown) => Object.assign(new Role(), entity)),
            save: jest.fn((entity: Role) => Promise.resolve(entity)),
            update: jest.fn(() => Promise.resolve({ affected: 1, raw: [], generatedMaps: [] } as UpdateResult)),
            delete: jest.fn(() => Promise.resolve({ affected: 1, raw: [] } as DeleteResult)),
        };

        service = new RoleService(roleRepository as unknown as Repository<Role>);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findOne', () => {
        it('should return role with rolePermissions and permission relations when found by id', async () => {
            const role = createMockRole({ id: 2, name: 'ORGANIZER' });
            roleRepository.findOne.mockResolvedValue(role);

            const result = await service.findOne(2);

            expect(roleRepository.findOne).toHaveBeenCalledWith({
                where: { id: 2 },
                relations: ['rolePermissions', 'rolePermissions.permission'],
            });
            expect(result).toEqual(role);
        });

        it('should return null when role id is not found', async () => {
            roleRepository.findOne.mockResolvedValue(null);

            const result = await service.findOne(99);

            expect(roleRepository.findOne).toHaveBeenCalledWith({
                where: { id: 99 },
                relations: ['rolePermissions', 'rolePermissions.permission'],
            });
            expect(result).toBeNull();
        });

        it('should propagate repository error when findOne fails', async () => {
            roleRepository.findOne.mockRejectedValue(new Error('Database query failure'));

            await expect(service.findOne(2)).rejects.toThrow('Database query failure');
        });
    });

    describe('findAll', () => {
        it('should return all roles with rolePermissions and permission relations', async () => {
            const roles = [createMockRole({ id: 1, name: 'ADMIN' }), createMockRole({ id: 2, name: 'ORGANIZER' })];
            roleRepository.find.mockResolvedValue(roles);

            const result = await service.findAll();

            expect(roleRepository.find).toHaveBeenCalledWith({
                relations: ['rolePermissions', 'rolePermissions.permission'],
            });
            expect(result).toEqual(roles);
        });

        it('should return an empty array when no roles exist', async () => {
            roleRepository.find.mockResolvedValue([]);

            const result = await service.findAll();

            expect(result).toEqual([]);
        });

        it('should propagate repository error when find fails', async () => {
            roleRepository.find.mockRejectedValue(new Error('Database search error'));

            await expect(service.findAll()).rejects.toThrow('Database search error');
        });
    });

    describe('findByName', () => {
        it('should return role with rolePermissions and permission relations when found by name', async () => {
            const role = createMockRole({ name: 'VOLUNTEER' });
            roleRepository.findOne.mockResolvedValue(role);

            const result = await service.findByName('VOLUNTEER');

            expect(roleRepository.findOne).toHaveBeenCalledWith({
                where: { name: 'VOLUNTEER' },
                relations: ['rolePermissions', 'rolePermissions.permission'],
            });
            expect(result).toEqual(role);
        });

        it('should return null when role name is not found', async () => {
            roleRepository.findOne.mockResolvedValue(null);

            const result = await service.findByName('UNKNOWN_ROLE');

            expect(roleRepository.findOne).toHaveBeenCalledWith({
                where: { name: 'UNKNOWN_ROLE' },
                relations: ['rolePermissions', 'rolePermissions.permission'],
            });
            expect(result).toBeNull();
        });

        it('should propagate repository error when findByName lookup fails', async () => {
            roleRepository.findOne.mockRejectedValue(new Error('Connection failure'));

            await expect(service.findByName('ADMIN')).rejects.toThrow('Connection failure');
        });
    });

    describe('create', () => {
        const dto: CreateRoleDto = {
            name: 'MODERATOR',
            description: 'Rol para moderación de contenido comunitario',
        };

        it('should successfully create and save a new role', async () => {
            const savedRole = createMockRole({ id: 4, ...dto, rolePermissions: [] });
            roleRepository.save.mockResolvedValue(savedRole);

            const result = await service.create(dto);

            expect(roleRepository.create).toHaveBeenCalledWith(dto);
            expect(roleRepository.save).toHaveBeenCalled();
            expect(result).toEqual(savedRole);
        });

        it('should propagate repository error when save fails', async () => {
            roleRepository.save.mockRejectedValue(new Error('Unique constraint violation'));

            await expect(service.create(dto)).rejects.toThrow('Unique constraint violation');
        });
    });

    describe('update', () => {
        const updateDto: UpdateRoleDto = {
            name: 'SUPER_ORGANIZER',
            description: 'Rol de organizador con permisos extendidos',
        };

        it('should successfully update role and return updated role with relations', async () => {
            const updated = createMockRole({ id: 2, ...updateDto });
            roleRepository.findOne.mockResolvedValue(updated);

            const result = await service.update(2, updateDto);

            expect(roleRepository.update).toHaveBeenCalledWith(2, updateDto);
            expect(roleRepository.findOne).toHaveBeenCalledWith({
                where: { id: 2 },
                relations: ['rolePermissions', 'rolePermissions.permission'],
            });
            expect(result).toEqual(updated);
        });

        it('should return null if updated role is not found on reload', async () => {
            roleRepository.findOne.mockResolvedValue(null);

            const result = await service.update(99, updateDto);

            expect(roleRepository.update).toHaveBeenCalledWith(99, updateDto);
            expect(result).toBeNull();
        });

        it('should propagate repository error when update fails', async () => {
            roleRepository.update.mockRejectedValue(new Error('Update failed'));

            await expect(service.update(2, updateDto)).rejects.toThrow('Update failed');
        });
    });

    describe('remove', () => {
        it('should delete role by id', async () => {
            await service.remove(2);

            expect(roleRepository.delete).toHaveBeenCalledWith(2);
        });

        it('should propagate repository error when delete fails', async () => {
            roleRepository.delete.mockRejectedValue(new Error('Foreign key violation'));

            await expect(service.remove(2)).rejects.toThrow('Foreign key violation');
        });
    });
});
