jest.mock('@nestjs/mapped-types', () => ({
    PartialType: (classRef: unknown) => classRef,
    OmitType: (classRef: unknown) => classRef,
    PickType: (classRef: unknown) => classRef,
    IntersectionType: (...classRefs: unknown[]) => classRefs[0],
}));

import { CausesController } from './causes.controller';
import { CausesService } from './causes.service';
import { CreateCauseDto } from './dto/create-cause.dto';
import { UpdateCauseDto } from './dto/update-cause.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { Cause } from './entities/cause.entity';

describe('CausesController', () => {
    let controller: CausesController;
    let causesService: jest.Mocked<CausesService>;

    const mockCause: Cause = {
        id: 1,
        organizer_id: 1,
        category_id: 1,
        title: 'Reforestacion',
        description: 'Siembra de arboles',
        cover_image_url: 'https://img.jpg',
        capacity: 50,
        start_date: new Date(),
        end_date: new Date(),
        address: 'Parque',
        location_latitude: '4.60',
        location_longitude: '-74.08',
        is_available: true,
        progress: 'open',
        qr_code: 'QR123',
    } as Cause;

    beforeEach(() => {
        causesService = {
            create: jest.fn(),
            findAll: jest.fn(),
            findMyCauses: jest.fn(),
            getCapacity: jest.fn(),
            findOne: jest.fn(),
            publish: jest.fn(),
            updateAvailability: jest.fn(),
            updateProgress: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
        } as unknown as jest.Mocked<CausesService>;

        controller = new CausesController(causesService);
    });

    describe('create', () => {
        it('should delegate cause creation to causesService.create', async () => {
            const dto: CreateCauseDto = {
                organizer_id: 1,
                category_id: 1,
                title: 'Reforestacion',
                cover_image_url: 'https://img.jpg',
                description: 'Siembra',
                start_date: '2026-11-01',
                end_date: '2026-11-02',
                address: 'Parque',
                location_latitude: '4.60',
                location_longitude: '-74.08',
            };
            causesService.create.mockResolvedValue(mockCause);

            const result = await controller.create(dto);

            expect(result).toEqual(mockCause);
            expect(causesService.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('findAll', () => {
        it('should call causesService.findAll and return causes', () => {
            causesService.findAll.mockReturnValue('This action returns all causes');

            const result = controller.findAll();

            expect(result).toBe('This action returns all causes');
            expect(causesService.findAll).toHaveBeenCalled();
        });
    });

    describe('findMyCauses', () => {
        it('should return causes owned by organizer id query', async () => {
            causesService.findMyCauses.mockResolvedValue([mockCause]);

            const result = await controller.findMyCauses(1);

            expect(result).toEqual([mockCause]);
            expect(causesService.findMyCauses).toHaveBeenCalledWith(1);
        });
    });

    describe('findByOrganizer', () => {
        it('should return causes owned by organizer id param', async () => {
            causesService.findMyCauses.mockResolvedValue([mockCause]);

            const result = await controller.findByOrganizer(1);

            expect(result).toEqual([mockCause]);
            expect(causesService.findMyCauses).toHaveBeenCalledWith(1);
        });
    });

    describe('getCapacity', () => {
        it('should return capacity calculation for cause and organizer', async () => {
            const capacityObj = { capacity: 50, registered: 10, available: 40 };
            causesService.getCapacity.mockResolvedValue(capacityObj as never);

            const result = await controller.getCapacity(1, 1);

            expect(result).toEqual(capacityObj);
            expect(causesService.getCapacity).toHaveBeenCalledWith(1, 1);
        });
    });

    describe('findOne', () => {
        it('should call causesService.findOne with converted id number', () => {
            causesService.findOne.mockReturnValue('This action returns a #1 cause');

            const result = controller.findOne('1');

            expect(result).toBe('This action returns a #1 cause');
            expect(causesService.findOne).toHaveBeenCalledWith(1);
        });
    });

    describe('publish', () => {
        it('should delegate publication to causesService.publish', async () => {
            causesService.publish.mockResolvedValue(mockCause);

            const result = await controller.publish(1, 1);

            expect(result).toEqual(mockCause);
            expect(causesService.publish).toHaveBeenCalledWith(1, 1);
        });
    });

    describe('updateAvailability', () => {
        it('should delegate availability update to causesService', async () => {
            const dto: UpdateAvailabilityDto = { is_available: false };
            causesService.updateAvailability.mockResolvedValue({ ...mockCause, is_available: false });

            const result = await controller.updateAvailability(1, 1, dto);

            expect(result.is_available).toBe(false);
            expect(causesService.updateAvailability).toHaveBeenCalledWith(1, 1, dto);
        });
    });

    describe('updateProgress', () => {
        it('should delegate progress update to causesService', async () => {
            const dto: UpdateProgressDto = { progress: 'completed' };
            causesService.updateProgress.mockResolvedValue({ ...mockCause, progress: 'completed' });

            const result = await controller.updateProgress(1, 1, dto);

            expect(result.progress).toBe('completed');
            expect(causesService.updateProgress).toHaveBeenCalledWith(1, 1, dto);
        });
    });

    describe('update', () => {
        it('should delegate details update to causesService', async () => {
            const dto: UpdateCauseDto = { title: 'Updated Title' };
            causesService.update.mockResolvedValue({ ...mockCause, title: 'Updated Title' });

            const result = await controller.update(1, 1, dto);

            expect(result.title).toBe('Updated Title');
            expect(causesService.update).toHaveBeenCalledWith(1, 1, dto);
        });
    });

    describe('remove', () => {
        it('should delegate removal to causesService.remove with numeric id', () => {
            causesService.remove.mockReturnValue(undefined as never);

            controller.remove('1');

            expect(causesService.remove).toHaveBeenCalledWith(1);
        });
    });

    describe('searchByKeywords', () => {
        it('should delegate search to causesService.searchByKeywords', async () => {
            const dto = { keyword: 'Arboles' };
            causesService.searchByKeywords = jest.fn().mockResolvedValue([mockCause] as never);

            const result = await controller.searchByKeywords(dto as any);

            expect(result).toEqual([mockCause]);
            expect(causesService.searchByKeywords).toHaveBeenCalledWith(dto);
        });
    });

    describe('filterByCategory', () => {
        it('should delegate filter to causesService.filterByCategory', async () => {
            const dto = { category_id: 1 };
            causesService.filterByCategory = jest.fn().mockResolvedValue([mockCause] as never);

            const result = await controller.filterByCategory(dto as any);

            expect(result).toEqual([mockCause]);
            expect(causesService.filterByCategory).toHaveBeenCalledWith(dto);
        });
    });
});
