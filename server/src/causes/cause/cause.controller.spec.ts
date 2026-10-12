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

import { CauseController } from './cause.controller';
import { CauseService } from './cause.service';
import { CreateCauseDto } from './dto/create-cause.dto';
import { UpdateCauseDto } from './dto/update-cause.dto';

describe('CauseController', () => {
    let controller: CauseController;
    let causeService: {
        create: jest.Mock<string, [CreateCauseDto]>;
        findAll: jest.Mock<string, []>;
        findOne: jest.Mock<string, [number]>;
        update: jest.Mock<string, [number, UpdateCauseDto]>;
        remove: jest.Mock<string, [number]>;
    };

    beforeEach(() => {
        causeService = {
            create: jest.fn().mockReturnValue('created'),
            findAll: jest.fn().mockReturnValue('all'),
            findOne: jest.fn().mockReturnValue('one'),
            update: jest.fn().mockReturnValue('updated'),
            remove: jest.fn().mockReturnValue('removed'),
        };

        controller = new CauseController(causeService as unknown as CauseService);
    });

    it('should create a cause', () => {
        const dto: CreateCauseDto = {};
        expect(controller.create(dto)).toBe('created');
        expect(causeService.create).toHaveBeenCalledWith(dto);
    });

    it('should find all causes', () => {
        expect(controller.findAll()).toBe('all');
        expect(causeService.findAll).toHaveBeenCalled();
    });

    it('should find one cause', () => {
        expect(controller.findOne('1')).toBe('one');
        expect(causeService.findOne).toHaveBeenCalledWith(1);
    });

    it('should update a cause', () => {
        const dto: UpdateCauseDto = {};
        expect(controller.update('1', dto)).toBe('updated');
        expect(causeService.update).toHaveBeenCalledWith(1, dto);
    });

    it('should remove a cause', () => {
        expect(controller.remove('1')).toBe('removed');
        expect(causeService.remove).toHaveBeenCalledWith(1);
    });
});

