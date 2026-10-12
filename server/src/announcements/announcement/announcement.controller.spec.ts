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

import { AnnouncementController } from './announcement.controller';
import { AnnouncementService } from './announcement.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

describe('AnnouncementController', () => {
    let controller: AnnouncementController;
    let announcementService: {
        create: jest.Mock<string, [CreateAnnouncementDto]>;
        findAll: jest.Mock<string, []>;
        findOne: jest.Mock<string, [number]>;
        update: jest.Mock<string, [number, UpdateAnnouncementDto]>;
        remove: jest.Mock<string, [number]>;
    };

    beforeEach(() => {
        announcementService = {
            create: jest.fn().mockReturnValue('created'),
            findAll: jest.fn().mockReturnValue('all'),
            findOne: jest.fn().mockReturnValue('one'),
            update: jest.fn().mockReturnValue('updated'),
            remove: jest.fn().mockReturnValue('removed'),
        };

        controller = new AnnouncementController(announcementService as unknown as AnnouncementService);
    });

    it('should create an announcement', () => {
        const dto: CreateAnnouncementDto = {};
        expect(controller.create(dto)).toBe('created');
        expect(announcementService.create).toHaveBeenCalledWith(dto);
    });

    it('should find all announcements', () => {
        expect(controller.findAll()).toBe('all');
        expect(announcementService.findAll).toHaveBeenCalled();
    });

    it('should find one announcement', () => {
        expect(controller.findOne('1')).toBe('one');
        expect(announcementService.findOne).toHaveBeenCalledWith(1);
    });

    it('should update an announcement', () => {
        const dto: UpdateAnnouncementDto = {};
        expect(controller.update('1', dto)).toBe('updated');
        expect(announcementService.update).toHaveBeenCalledWith(1, dto);
    });

    it('should remove an announcement', () => {
        expect(controller.remove('1')).toBe('removed');
        expect(announcementService.remove).toHaveBeenCalledWith(1);
    });
});

