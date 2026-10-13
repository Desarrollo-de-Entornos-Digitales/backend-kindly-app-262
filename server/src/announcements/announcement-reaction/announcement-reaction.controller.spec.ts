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

import { AnnouncementReactionController } from './announcement-reaction.controller';
import { AnnouncementReactionService } from './announcement-reaction.service';
import { CreateAnnouncementReactionDto } from './dto/create-announcement-reaction.dto';
import { UpdateAnnouncementReactionDto } from './dto/update-announcement-reaction.dto';

describe('AnnouncementReactionController', () => {
    let controller: AnnouncementReactionController;
    let reactionService: {
        create: jest.Mock<string, [CreateAnnouncementReactionDto]>;
        findAll: jest.Mock<string, []>;
        findOne: jest.Mock<string, [number]>;
        update: jest.Mock<string, [number, UpdateAnnouncementReactionDto]>;
        remove: jest.Mock<string, [number]>;
    };

    beforeEach(() => {
        reactionService = {
            create: jest.fn().mockReturnValue('created'),
            findAll: jest.fn().mockReturnValue('all'),
            findOne: jest.fn().mockReturnValue('one'),
            update: jest.fn().mockReturnValue('updated'),
            remove: jest.fn().mockReturnValue('removed'),
        };

        controller = new AnnouncementReactionController(reactionService as unknown as AnnouncementReactionService);
    });

    it('should create an announcement reaction', () => {
        const dto: CreateAnnouncementReactionDto = {};
        expect(controller.create(dto)).toBe('created');
        expect(reactionService.create).toHaveBeenCalledWith(dto);
    });

    it('should find all announcement reactions', () => {
        expect(controller.findAll()).toBe('all');
        expect(reactionService.findAll).toHaveBeenCalled();
    });

    it('should find one announcement reaction', () => {
        expect(controller.findOne('1')).toBe('one');
        expect(reactionService.findOne).toHaveBeenCalledWith(1);
    });

    it('should update an announcement reaction', () => {
        const dto: UpdateAnnouncementReactionDto = {};
        expect(controller.update('1', dto)).toBe('updated');
        expect(reactionService.update).toHaveBeenCalledWith(1, dto);
    });

    it('should remove an announcement reaction', () => {
        expect(controller.remove('1')).toBe('removed');
        expect(reactionService.remove).toHaveBeenCalledWith(1);
    });
});
