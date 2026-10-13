jest.mock('@nestjs/passport', () => ({
    AuthGuard: () => class {},
    PassportStrategy: () => class {},
}));

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { User } from './entities/user.entity';

describe('UsersController', () => {
    let controller: UsersController;
    let usersService: jest.Mocked<UsersService>;

    const mockUser: User = {
        id: 1,
        name: 'Maria Lopez',
        username: 'marialopez',
        email: 'maria@kindly.org',
        contact: '+573009876543',
        password: 'hashedpassword',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
    } as unknown as User;

    beforeEach(() => {
        usersService = {
            findAll: jest.fn(),
            findOne: jest.fn(),
            updateStatus: jest.fn(),
            assignRole: jest.fn(),
        } as unknown as jest.Mocked<UsersService>;

        controller = new UsersController(usersService);
    });

    describe('findAll', () => {
        it('should delegate query options to usersService.findAll', async () => {
            const query: QueryUsersDto = { page: 1, limit: 10, search: 'maria' };
            const paginatedResponse = { data: [mockUser], total: 1, page: 1, limit: 10 };
            usersService.findAll.mockResolvedValue(paginatedResponse as never);

            const result = await controller.findAll(query);

            expect(result).toEqual(paginatedResponse);
            expect(usersService.findAll).toHaveBeenCalledWith(query);
        });
    });

    describe('findOne', () => {
        it('should delegate ID lookup to usersService.findOne', async () => {
            usersService.findOne.mockResolvedValue(mockUser);

            const result = await controller.findOne(1);

            expect(result).toEqual(mockUser);
            expect(usersService.findOne).toHaveBeenCalledWith(1);
        });
    });

    describe('updateStatus', () => {
        it('should delegate status modification to usersService.updateStatus', async () => {
            const dto: UpdateUserStatusDto = { is_active: false };
            const updatedUser = { ...mockUser, is_active: false };
            usersService.updateStatus.mockResolvedValue(updatedUser);

            const result = await controller.updateStatus(1, dto);

            expect(result).toEqual(updatedUser);
            expect(usersService.updateStatus).toHaveBeenCalledWith(1, dto);
        });
    });

    describe('assignRole', () => {
        it('should delegate role assignment to usersService.assignRole', async () => {
            const dto: AssignRoleDto = { role_id: 2 };
            usersService.assignRole.mockResolvedValue(mockUser);

            const result = await controller.assignRole(1, dto);

            expect(result).toEqual(mockUser);
            expect(usersService.assignRole).toHaveBeenCalledWith(1, dto);
        });
    });
});
