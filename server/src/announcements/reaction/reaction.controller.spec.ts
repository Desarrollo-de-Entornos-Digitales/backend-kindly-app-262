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

import { ReactionController } from './reaction.controller';
import { ReactionService } from './reaction.service';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { UpdateReactionDto } from './dto/update-reaction.dto';

describe('ReactionController', () => {
    let controller: ReactionController;
    let reactionService: {
        create: jest.Mock<string, [CreateReactionDto]>;
        findAll: jest.Mock<string, []>;
        findOne: jest.Mock<string, [number]>;
        update: jest.Mock<string, [number, UpdateReactionDto]>;
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

        controller = new ReactionController(reactionService as unknown as ReactionService);
    });

    it('should create a reaction', () => {
        const dto: CreateReactionDto = {};
        expect(controller.create(dto)).toBe('created');
        expect(reactionService.create).toHaveBeenCalledWith(dto);
    });

    it('should find all reactions', () => {
        expect(controller.findAll()).toBe('all');
        expect(reactionService.findAll).toHaveBeenCalled();
    });

    it('should find one reaction', () => {
        expect(controller.findOne('1')).toBe('one');
        expect(reactionService.findOne).toHaveBeenCalledWith(1);
    });

    it('should update a reaction', () => {
        const dto: UpdateReactionDto = {};
        expect(controller.update('1', dto)).toBe('updated');
        expect(reactionService.update).toHaveBeenCalledWith(1, dto);
    });

    it('should remove a reaction', () => {
        expect(controller.remove('1')).toBe('removed');
        expect(reactionService.remove).toHaveBeenCalledWith(1);
    });
});

