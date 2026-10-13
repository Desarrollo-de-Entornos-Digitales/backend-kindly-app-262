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

import { VolunteerController } from './volunteer.controller';
import { VolunteerService } from './volunteer.service';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { UpdateVolunteerDto } from './dto/update-volunteer.dto';
import { Volunteer } from '../entities/volunteer.entity';

describe('VolunteerController', () => {
    let controller: VolunteerController;
    let volunteerService: {
        create: jest.Mock<Promise<Volunteer>, [CreateVolunteerDto]>;
        findAll: jest.Mock<Promise<Volunteer[]>, []>;
        findOne: jest.Mock<Promise<Volunteer>, [number]>;
        update: jest.Mock<Promise<Volunteer>, [number, UpdateVolunteerDto]>;
        remove: jest.Mock<Promise<void>, [number]>;
    };

    const mockVolunteer: Volunteer = {
        id: 1,
        user_id: 1,
        birthdate: new Date('1995-05-10'),
        bio: 'Volunteer bio',
        availability: 'weekends',
        created_at: new Date(),
    } as unknown as Volunteer;

    beforeEach(() => {
        volunteerService = {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
        };

        controller = new VolunteerController(volunteerService as unknown as VolunteerService);
    });

    describe('create', () => {
        it('should create and return volunteer', async () => {
            const dto: CreateVolunteerDto = {
                user_id: 1,
                shirt_size: 'M',
                height: '175',
                health_center: 'Centro de Salud Central',
                blood_type: 'O+',
                emergency_contact: '3001234567',
                description: 'Volunteer bio',
            };
            volunteerService.create.mockResolvedValue(mockVolunteer);

            const result = await controller.create(dto);
            expect(volunteerService.create).toHaveBeenCalledWith(dto);
            expect(result).toBe(mockVolunteer);
        });
    });

    describe('findAll', () => {
        it('should return all volunteers', async () => {
            volunteerService.findAll.mockResolvedValue([mockVolunteer]);

            const result = await controller.findAll();
            expect(volunteerService.findAll).toHaveBeenCalled();
            expect(result).toEqual([mockVolunteer]);
        });
    });

    describe('findOne', () => {
        it('should return a single volunteer', async () => {
            volunteerService.findOne.mockResolvedValue(mockVolunteer);

            const result = await controller.findOne(1);
            expect(volunteerService.findOne).toHaveBeenCalledWith(1);
            expect(result).toBe(mockVolunteer);
        });
    });

    describe('update', () => {
        it('should update and return volunteer', async () => {
            const dto: UpdateVolunteerDto = { description: 'Updated bio' };
            volunteerService.update.mockResolvedValue(mockVolunteer);

            const result = await controller.update(1, dto);
            expect(volunteerService.update).toHaveBeenCalledWith(1, dto);
            expect(result).toBe(mockVolunteer);
        });
    });

    describe('remove', () => {
        it('should delete volunteer', async () => {
            volunteerService.remove.mockResolvedValue(undefined);

            await controller.remove(1);
            expect(volunteerService.remove).toHaveBeenCalledWith(1);
        });
    });
});
