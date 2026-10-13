jest.mock('@nestjs/passport', () => ({
    AuthGuard: () => class {},
    PassportStrategy: () => class {},
}));

import { VolunteerCategoryController } from './volunteer-category.controller';
import { VolunteerCategoryService } from './volunteer-category.service';
import { CreateVolunteerCategoryDto } from './dto/create-volunteer-category.dto';
import { VolunteerCategory } from '../entities/volunteer-category.entity';

describe('VolunteerCategoryController', () => {
    let controller: VolunteerCategoryController;
    let service: jest.Mocked<VolunteerCategoryService>;

    const mockRecord: VolunteerCategory = {
        volunteer_id: 1,
        category_id: 2,
    } as VolunteerCategory;

    beforeEach(() => {
        service = {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
        } as unknown as jest.Mocked<VolunteerCategoryService>;

        controller = new VolunteerCategoryController(service);
    });

    describe('create', () => {
        it('should link category to volunteer', async () => {
            const dto: CreateVolunteerCategoryDto = { volunteer_id: 1, category_id: 2 };
            service.create.mockResolvedValue(mockRecord);

            const result = await controller.create(dto);

            expect(result).toEqual(mockRecord);
            expect(service.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('findAll', () => {
        it('should return all volunteer categories with parsed ID query', async () => {
            service.findAll.mockResolvedValue([mockRecord]);

            const result = await controller.findAll('1');

            expect(result).toEqual([mockRecord]);
            expect(service.findAll).toHaveBeenCalledWith(1);
        });

        it('should return all volunteer categories without filter when query is absent', async () => {
            service.findAll.mockResolvedValue([mockRecord]);

            const result = await controller.findAll(undefined);

            expect(result).toEqual([mockRecord]);
            expect(service.findAll).toHaveBeenCalledWith(undefined);
        });
    });

    describe('findOne', () => {
        it('should return volunteer category pair', async () => {
            service.findOne.mockResolvedValue(mockRecord);

            const result = await controller.findOne(1, 2);

            expect(result).toEqual(mockRecord);
            expect(service.findOne).toHaveBeenCalledWith(1, 2);
        });
    });

    describe('remove', () => {
        it('should unlink category from volunteer', async () => {
            service.remove.mockResolvedValue(undefined);

            await controller.remove(1, 2);

            expect(service.remove).toHaveBeenCalledWith(1, 2);
        });
    });
});
