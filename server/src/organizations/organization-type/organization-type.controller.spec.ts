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

import { OrganizationTypeController } from './organization-type.controller';
import { OrganizationTypeService } from './organization-type.service';
import { CreateOrganizationTypeDto } from './dto/create-organization-type.dto';
import { UpdateOrganizationTypeDto } from './dto/update-organization-type.dto';
import { OrganizationType } from '../entities/organization-type.entity';

describe('OrganizationTypeController', () => {
    let controller: OrganizationTypeController;
    let service: jest.Mocked<OrganizationTypeService>;

    const mockType: OrganizationType = {
        id: 1,
        name: 'ONG',
        description: 'Organizacion no gubernamental',
        organizers: [],
    };

    beforeEach(() => {
        service = {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
        } as unknown as jest.Mocked<OrganizationTypeService>;

        controller = new OrganizationTypeController(service);
    });

    describe('findAll', () => {
        it('should return all organization types', async () => {
            service.findAll.mockResolvedValue([mockType]);

            const result = await controller.findAll();

            expect(result).toEqual([mockType]);
            expect(service.findAll).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return organization type by ID', async () => {
            service.findOne.mockResolvedValue(mockType);

            const result = await controller.findOne(1);

            expect(result).toEqual(mockType);
            expect(service.findOne).toHaveBeenCalledWith(1);
        });
    });

    describe('create', () => {
        it('should create an organization type', async () => {
            const dto: CreateOrganizationTypeDto = { name: 'ONG', description: 'Desc' };
            service.create.mockResolvedValue(mockType);

            const result = await controller.create(dto);

            expect(result).toEqual(mockType);
            expect(service.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('update', () => {
        it('should update organization type', async () => {
            const dto: UpdateOrganizationTypeDto = { description: 'Updated' };
            service.update.mockResolvedValue({ ...mockType, description: 'Updated' });

            const result = await controller.update(1, dto);

            expect(result.description).toBe('Updated');
            expect(service.update).toHaveBeenCalledWith(1, dto);
        });
    });

    describe('remove', () => {
        it('should remove organization type', async () => {
            service.remove.mockResolvedValue(undefined);

            await controller.remove(1);

            expect(service.remove).toHaveBeenCalledWith(1);
        });
    });
});
