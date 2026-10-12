jest.mock('@nestjs/mapped-types', () => ({
    PartialType: (classRef: unknown) => classRef,
}));

jest.mock('@nestjs/passport', () => ({
    AuthGuard: () => class {},
    PassportStrategy: () => class {},
}));

import { VolunteersController } from './volunteers.controller';
import { VolunteersService } from './volunteers.service';
import { CreateVolunteerDto } from './volunteer/dto/create-volunteer.dto';
import { UpdateVolunteerDto } from './volunteer/dto/update-volunteer.dto';
import { QueryVolunteersDto } from './dto/query-volunteers.dto';
import { Volunteer } from './entities/volunteer.entity';

describe('VolunteersController', () => {
    let controller: VolunteersController;
    let volunteersService: jest.Mocked<VolunteersService>;

    const mockVolunteer: Volunteer = {
        id: 1,
        user_id: 10,
        description: 'Volunteer bio',
        shirt_size: 'M',
        height: '175',
        health_center: 'Centro de Salud',
        blood_type: 'O+',
        emergency_contact: '+573112223344',
    } as Volunteer;

    beforeEach(() => {
        volunteersService = {
            findByUserId: jest.fn(),
            updateByUserId: jest.fn(),
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
        } as unknown as jest.Mocked<VolunteersService>;

        controller = new VolunteersController(volunteersService);
    });

    describe('getMyProfile', () => {
        it('should extract userId from current user and return volunteer profile', async () => {
            volunteersService.findByUserId.mockResolvedValue(mockVolunteer);

            const result = await controller.getMyProfile({ sub: 10 });

            expect(result).toEqual(mockVolunteer);
            expect(volunteersService.findByUserId).toHaveBeenCalledWith(10);
        });

        it('should fallback to user.id if user.sub is undefined', async () => {
            volunteersService.findByUserId.mockResolvedValue(mockVolunteer);

            const result = await controller.getMyProfile({ id: 10 });

            expect(result).toEqual(mockVolunteer);
            expect(volunteersService.findByUserId).toHaveBeenCalledWith(10);
        });
    });

    describe('updateMyProfile', () => {
        it('should delegate update to volunteersService.updateByUserId', async () => {
            const dto: UpdateVolunteerDto = { description: 'Updated bio' };
            volunteersService.updateByUserId.mockResolvedValue({ ...mockVolunteer, description: 'Updated bio' });

            const result = await controller.updateMyProfile({ sub: 10 }, dto);

            expect(result.description).toBe('Updated bio');
            expect(volunteersService.updateByUserId).toHaveBeenCalledWith(10, dto);
        });
    });

    describe('create', () => {
        it('should assign user id from token if missing in dto and call create', async () => {
            const dto: CreateVolunteerDto = {
                user_id: 0,
                description: 'New bio',
                shirt_size: 'S',
                height: '165',
                health_center: 'Hospital Central',
                blood_type: 'A+',
                emergency_contact: '12345',
            };
            volunteersService.create.mockResolvedValue(mockVolunteer);

            const result = await controller.create({ id: 10 }, dto);

            expect(result).toEqual(mockVolunteer);
            expect(dto.user_id).toBe(10);
            expect(volunteersService.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('findAll', () => {
        it('should delegate query params to volunteersService.findAll', async () => {
            const query: QueryVolunteersDto = { page: 1, limit: 10 };
            const paginated = { data: [mockVolunteer], total: 1, page: 1, limit: 10 };
            volunteersService.findAll.mockResolvedValue(paginated as never);

            const result = await controller.findAll(query);

            expect(result).toEqual(paginated);
            expect(volunteersService.findAll).toHaveBeenCalledWith(query);
        });
    });

    describe('findOne', () => {
        it('should fetch single volunteer by id', async () => {
            volunteersService.findOne.mockResolvedValue(mockVolunteer);

            const result = await controller.findOne(1);

            expect(result).toEqual(mockVolunteer);
            expect(volunteersService.findOne).toHaveBeenCalledWith(1);
        });
    });

    describe('update', () => {
        it('should update volunteer by id', async () => {
            const dto: UpdateVolunteerDto = { shirt_size: 'L' };
            volunteersService.update.mockResolvedValue({ ...mockVolunteer, shirt_size: 'L' });

            const result = await controller.update(1, dto);

            expect(result.shirt_size).toBe('L');
            expect(volunteersService.update).toHaveBeenCalledWith(1, dto);
        });
    });

    describe('remove', () => {
        it('should remove volunteer by id', async () => {
            volunteersService.remove.mockResolvedValue(undefined);

            await controller.remove(1);

            expect(volunteersService.remove).toHaveBeenCalledWith(1);
        });
    });
});
