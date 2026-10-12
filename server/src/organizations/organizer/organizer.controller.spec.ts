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

import { OrganizerController } from './organizer.controller';
import { OrganizerService } from './organizer.service';
import { CreateOrganizerDto } from './dto/create-organizer.dto';
import { UpdateOrganizerDto } from './dto/update-organizer.dto';
import { Organizer } from '../entities/organizer.entity';

describe('OrganizerController', () => {
    let controller: OrganizerController;
    let service: jest.Mocked<OrganizerService>;

    const mockOrganizer: Organizer = {
        id: 1,
        user_id: 1,
        name: 'Fundacion Sol',
        description: 'Organizacion social',
        is_organization: false,
        organization_type_id: 1,
        verification_status: 'verified',
        causes: [],
    } as unknown as Organizer;

    beforeEach(() => {
        service = {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
        } as unknown as jest.Mocked<OrganizerService>;

        controller = new OrganizerController(service);
    });

    describe('create', () => {
        it('should create an organizer', async () => {
            const dto: CreateOrganizerDto = {
                name: 'Fundacion Sol',
                description: 'Organizacion social',
                is_organization: false,
                organization_type_id: 1,
            };
            service.create.mockResolvedValue(mockOrganizer);

            const result = await controller.create(dto);

            expect(result).toEqual(mockOrganizer);
            expect(service.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('findAll', () => {
        it('should return all organizers', async () => {
            service.findAll.mockResolvedValue([mockOrganizer]);

            const result = await controller.findAll();

            expect(result).toEqual([mockOrganizer]);
            expect(service.findAll).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return organizer by ID', async () => {
            service.findOne.mockResolvedValue(mockOrganizer);

            const result = await controller.findOne(1);

            expect(result).toEqual(mockOrganizer);
            expect(service.findOne).toHaveBeenCalledWith(1);
        });
    });

    describe('update', () => {
        it('should update organizer by ID', async () => {
            const dto: UpdateOrganizerDto = { description: 'Updated' };
            service.update.mockResolvedValue({ ...mockOrganizer, description: 'Updated' });

            const result = await controller.update(1, dto);

            expect(result.description).toBe('Updated');
            expect(service.update).toHaveBeenCalledWith(1, dto);
        });
    });

    describe('remove', () => {
        it('should remove organizer by ID', async () => {
            service.remove.mockResolvedValue(undefined);

            await controller.remove(1);

            expect(service.remove).toHaveBeenCalledWith(1);
        });
    });
});
