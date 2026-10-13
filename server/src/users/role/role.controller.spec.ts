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
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from '../entities/role.entity';

describe('RoleController', () => {
    let controller: RoleController;
    let service: jest.Mocked<RoleService>;

    const mockRole: Role = {
        id: 1,
        name: 'volunteer',
        description: 'Volunteer role',
        users: [],
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
        } as unknown as jest.Mocked<RoleService>;

        controller = new RoleController(service);
    });

    describe('create', () => {
        it('should create a role', async () => {
            const dto: CreateRoleDto = { name: 'volunteer', description: 'Volunteer role' };
            service.create.mockResolvedValue(mockRole);

            const result = await controller.create(dto);

            expect(result).toEqual(mockRole);
            expect(service.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('findAll', () => {
        it('should return all roles', async () => {
            service.findAll.mockResolvedValue([mockRole]);

            const result = await controller.findAll();

            expect(result).toEqual([mockRole]);
            expect(service.findAll).toHaveBeenCalled();
        });
    });

    describe('findByName', () => {
        it('should return role when found by name', async () => {
            service.findByName.mockResolvedValue(mockRole);

            const result = await controller.findByName('volunteer');

            expect(result).toEqual(mockRole);
            expect(service.findByName).toHaveBeenCalledWith('volunteer');
        });

        it('should throw NotFoundException when role not found by name', async () => {
            service.findByName.mockResolvedValue(null);

            await expect(controller.findByName('nonexistent')).rejects.toThrow(NotFoundException);
        });
    });

    describe('findOne', () => {
        it('should return role when found by ID', async () => {
            service.findOne.mockResolvedValue(mockRole);

            const result = await controller.findOne(1);

            expect(result).toEqual(mockRole);
            expect(service.findOne).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException when role not found by ID', async () => {
            service.findOne.mockResolvedValue(null);

            await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update role when found', async () => {
            const dto: UpdateRoleDto = { description: 'Updated' };
            service.update.mockResolvedValue({ ...mockRole, description: 'Updated' });

            const result = await controller.update(1, dto);

            expect(result.description).toBe('Updated');
            expect(service.update).toHaveBeenCalledWith(1, dto);
        });

        it('should throw NotFoundException when updating non-existent role', async () => {
            service.update.mockResolvedValue(null);

            await expect(controller.update(999, {})).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should find and remove role when found', async () => {
            service.findOne.mockResolvedValue(mockRole);
            service.remove.mockResolvedValue(undefined);

            await controller.remove(1);

            expect(service.remove).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException when deleting non-existent role', async () => {
            service.findOne.mockResolvedValue(null);

            await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
        });
    });
});
