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

import { NotFoundException } from '@nestjs/common';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from '../entities/permission.entity';

describe('PermissionController', () => {
    let controller: PermissionController;
    let service: jest.Mocked<PermissionService>;

    const mockPermission: Permission = {
        id: 1,
        name: 'participate_causes',
        description: 'Permission description',
        rolePermissions: [],
    };

    beforeEach(() => {
        service = {
            create: jest.fn(),
            findAll: jest.fn(),
            findByName: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
        } as unknown as jest.Mocked<PermissionService>;

        controller = new PermissionController(service);
    });

    describe('create', () => {
        it('should create a permission', async () => {
            const dto: CreatePermissionDto = { name: 'participate_causes', description: 'Permission description' };
            service.create.mockResolvedValue(mockPermission);

            const result = await controller.create(dto);

            expect(result).toEqual(mockPermission);
            expect(service.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('findAll', () => {
        it('should return all permissions', async () => {
            service.findAll.mockResolvedValue([mockPermission]);

            const result = await controller.findAll();

            expect(result).toEqual([mockPermission]);
            expect(service.findAll).toHaveBeenCalled();
        });
    });

    describe('findByName', () => {
        it('should return permission when found by name', async () => {
            service.findByName.mockResolvedValue(mockPermission);

            const result = await controller.findByName('participate_causes');

            expect(result).toEqual(mockPermission);
            expect(service.findByName).toHaveBeenCalledWith('participate_causes');
        });

        it('should throw NotFoundException when permission not found by name', async () => {
            service.findByName.mockResolvedValue(null);

            await expect(controller.findByName('nonexistent')).rejects.toThrow(NotFoundException);
        });
    });

    describe('findOne', () => {
        it('should return permission when found by ID', async () => {
            service.findOne.mockResolvedValue(mockPermission);

            const result = await controller.findOne(1);

            expect(result).toEqual(mockPermission);
            expect(service.findOne).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException when permission not found by ID', async () => {
            service.findOne.mockResolvedValue(null);

            await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update permission when found', async () => {
            const dto: UpdatePermissionDto = { description: 'Updated' };
            service.update.mockResolvedValue({ ...mockPermission, description: 'Updated' });

            const result = await controller.update(1, dto);

            expect(result.description).toBe('Updated');
            expect(service.update).toHaveBeenCalledWith(1, dto);
        });

        it('should throw NotFoundException when updating non-existent permission', async () => {
            service.update.mockResolvedValue(null);

            await expect(controller.update(999, {})).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should find and remove permission when found', async () => {
            service.findOne.mockResolvedValue(mockPermission);
            service.remove.mockResolvedValue(undefined);

            await controller.remove(1);

            expect(service.remove).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException when deleting non-existent permission', async () => {
            service.findOne.mockResolvedValue(null);

            await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
        });
    });
});
