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

import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';

describe('MediaController', () => {
    let controller: MediaController;
    let mediaService: {
        create: jest.Mock<string, [CreateMediaDto]>;
        findAll: jest.Mock<string, []>;
        findOne: jest.Mock<string, [number]>;
        update: jest.Mock<string, [number, UpdateMediaDto]>;
        remove: jest.Mock<string, [number]>;
    };

    beforeEach(() => {
        mediaService = {
            create: jest.fn().mockReturnValue('created'),
            findAll: jest.fn().mockReturnValue('all'),
            findOne: jest.fn().mockReturnValue('one'),
            update: jest.fn().mockReturnValue('updated'),
            remove: jest.fn().mockReturnValue('removed'),
        };

        controller = new MediaController(mediaService as unknown as MediaService);
    });

    it('should create media', () => {
        const dto: CreateMediaDto = {};
        expect(controller.create(dto)).toBe('created');
        expect(mediaService.create).toHaveBeenCalledWith(dto);
    });

    it('should find all media', () => {
        expect(controller.findAll()).toBe('all');
        expect(mediaService.findAll).toHaveBeenCalled();
    });

    it('should find one media', () => {
        expect(controller.findOne('1')).toBe('one');
        expect(mediaService.findOne).toHaveBeenCalledWith(1);
    });

    it('should update media', () => {
        const dto: UpdateMediaDto = {};
        expect(controller.update('1', dto)).toBe('updated');
        expect(mediaService.update).toHaveBeenCalledWith(1, dto);
    });

    it('should remove media', () => {
        expect(controller.remove('1')).toBe('removed');
        expect(mediaService.remove).toHaveBeenCalledWith(1);
    });
});

