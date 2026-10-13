import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';

import { PermissionService } from './permission.service';
import { Permission } from '../entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

describe('PermissionService', () => {
    let service: PermissionService;

    let permissionRepository: {
        find: jest.Mock<(...args: unknown[]) => Promise<Permission[]>>;
        findOneBy: jest.Mock<(...args: unknown[]) => Promise<Permission | null>>;
        create: jest.Mock<(...args: unknown[]) => Permission>;
        save: jest.Mock<(...args: unknown[]) => Promise<Permission>>;
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

    beforeEach(() => {
        permissionRepository = {
            find: jest.fn(() => Promise.resolve([createMockPermission()])),
            findOneBy: jest.fn(() => Promise.resolve(createMockPermission())),
            create: jest.fn((entity: unknown) => Object.assign(new Permission(), entity)),
            save: jest.fn((entity: Permission) => Promise.resolve(entity)),
            update: jest.fn(() => Promise.resolve({ affected: 1, raw: [], generatedMaps: [] } as UpdateResult)),
            delete: jest.fn(() => Promise.resolve({ affected: 1, raw: [] } as DeleteResult)),
        };

        service = new PermissionService(permissionRepository as unknown as Repository<Permission>);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all permissions', async () => {
            const permissions = [
                createMockPermission({ id: 1, name: 'manage_causes' }),
                createMockPermission({ id: 2, name: 'manage_volunteers' }),
            ];
            permissionRepository.find.mockResolvedValue(permissions);

            const result = await service.findAll();

            expect(permissionRepository.find).toHaveBeenCalled();
            expect(result).toEqual(permissions);
        });

        it('should return an empty array when no permissions exist', async () => {
            permissionRepository.find.mockResolvedValue([]);

            const result = await service.findAll();

            expect(result).toEqual([]);
        });

        it('should propagate repository error when find fails', async () => {
            permissionRepository.find.mockRejectedValue(new Error('Database search failed'));

            await expect(service.findAll()).rejects.toThrow('Database search failed');
        });
    });

    describe('findOne', () => {
        it('should return permission when found by id', async () => {
            const permission = createMockPermission({ id: 1, name: 'manage_causes' });
            permissionRepository.findOneBy.mockResolvedValue(permission);

            const result = await service.findOne(1);

            expect(permissionRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
            expect(result).toEqual(permission);
        });

        it('should return null when permission id does not exist', async () => {
            permissionRepository.findOneBy.mockResolvedValue(null);

            const result = await service.findOne(99);

            expect(permissionRepository.findOneBy).toHaveBeenCalledWith({ id: 99 });
            expect(result).toBeNull();
        });

        it('should propagate repository error when findOneBy fails', async () => {
            permissionRepository.findOneBy.mockRejectedValue(new Error('Connection failure'));

            await expect(service.findOne(1)).rejects.toThrow('Connection failure');
        });
    });

    describe('findByName', () => {
        it('should return permission when found by name', async () => {
            const permission = createMockPermission({ name: 'create_announcements' });
            permissionRepository.findOneBy.mockResolvedValue(permission);

            const result = await service.findByName('create_announcements');

            expect(permissionRepository.findOneBy).toHaveBeenCalledWith({
                name: 'create_announcements',
            });
            expect(result).toEqual(permission);
        });

        it('should return null when permission name does not exist', async () => {
            permissionRepository.findOneBy.mockResolvedValue(null);

            const result = await service.findByName('unknown_permission');

            expect(permissionRepository.findOneBy).toHaveBeenCalledWith({
                name: 'unknown_permission',
            });
            expect(result).toBeNull();
        });

        it('should propagate repository error when findByName lookup fails', async () => {
            permissionRepository.findOneBy.mockRejectedValue(new Error('Timeout searching permission'));

            await expect(service.findByName('manage_causes')).rejects.toThrow('Timeout searching permission');
        });
    });

    describe('create', () => {
        const dto: CreatePermissionDto = {
            name: 'approve_volunteers',
            description: 'Permiso para aprobar solicitudes de voluntarios',
        };

        it('should successfully create and return a new permission', async () => {
            const savedPermission = createMockPermission({ id: 3, ...dto });
            permissionRepository.save.mockResolvedValue(savedPermission);

            const result = await service.create(dto);

            expect(permissionRepository.create).toHaveBeenCalledWith(dto);
            expect(permissionRepository.save).toHaveBeenCalled();
            expect(result).toEqual(savedPermission);
        });

        it('should propagate repository error when save fails', async () => {
            permissionRepository.save.mockRejectedValue(new Error('Save constraint error'));

            await expect(service.create(dto)).rejects.toThrow('Save constraint error');
        });
    });

    describe('update', () => {
        const updateDto: UpdatePermissionDto = {
            name: 'manage_all_causes',
            description: 'Permiso ampliado para gestionar cualquier causa',
        };

        it('should successfully update and return the updated permission', async () => {
            const updated = createMockPermission({ id: 1, ...updateDto });
            permissionRepository.findOneBy.mockResolvedValue(updated);

            const result = await service.update(1, updateDto);

            expect(permissionRepository.update).toHaveBeenCalledWith(1, updateDto);
            expect(permissionRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
            expect(result).toEqual(updated);
        });

        it('should return null if permission is not found after update', async () => {
            permissionRepository.findOneBy.mockResolvedValue(null);

            const result = await service.update(99, updateDto);

            expect(permissionRepository.update).toHaveBeenCalledWith(99, updateDto);
            expect(result).toBeNull();
        });

        it('should propagate repository error when update fails', async () => {
            permissionRepository.update.mockRejectedValue(new Error('Update DB error'));

            await expect(service.update(1, updateDto)).rejects.toThrow('Update DB error');
        });
    });

    describe('remove', () => {
        it('should delete permission by id', async () => {
            await service.remove(1);

            expect(permissionRepository.delete).toHaveBeenCalledWith(1);
        });

        it('should propagate repository error when delete fails', async () => {
            permissionRepository.delete.mockRejectedValue(new Error('Delete DB error'));

            await expect(service.remove(1)).rejects.toThrow('Delete DB error');
        });
    });
});
