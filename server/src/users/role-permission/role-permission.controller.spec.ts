import { RolePermissionController } from './role-permission.controller';
import { RolePermissionService } from './role-permission.service';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { RolePermission } from '../entities/role-permission.entity';

describe('RolePermissionController', () => {
    let controller: RolePermissionController;
    let service: jest.Mocked<RolePermissionService>;

    const mockRecord: RolePermission = {
        role_id: 1,
        permission_id: 2,
    } as RolePermission;

    beforeEach(() => {
        service = {
            create: jest.fn(),
            findAll: jest.fn(),
            findByRole: jest.fn(),
            remove: jest.fn(),
        } as unknown as jest.Mocked<RolePermissionService>;

        controller = new RolePermissionController(service);
    });

    describe('create', () => {
        it('should assign permission to role', async () => {
            const dto: CreateRolePermissionDto = { role_id: 1, permission_id: 2 };
            service.create.mockResolvedValue(mockRecord);

            const result = await controller.create(dto);

            expect(result).toEqual(mockRecord);
            expect(service.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('findAll', () => {
        it('should return all role-permissions', async () => {
            service.findAll.mockResolvedValue([mockRecord]);

            const result = await controller.findAll();

            expect(result).toEqual([mockRecord]);
            expect(service.findAll).toHaveBeenCalled();
        });
    });

    describe('findByRole', () => {
        it('should return permissions assigned to role', async () => {
            service.findByRole.mockResolvedValue([mockRecord]);

            const result = await controller.findByRole(1);

            expect(result).toEqual([mockRecord]);
            expect(service.findByRole).toHaveBeenCalledWith(1);
        });
    });

    describe('remove', () => {
        it('should remove permission from role', async () => {
            service.remove.mockResolvedValue(undefined);

            await controller.remove(1, 2);

            expect(service.remove).toHaveBeenCalledWith(1, 2);
        });
    });
});
