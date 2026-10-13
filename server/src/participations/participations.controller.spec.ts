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

import { ParticipationsController } from './participations.controller';
import { ParticipationsService } from './participations.service';
import { CreateParticipationDto } from './dto/create-participation.dto';
import { UpdateParticipationDto } from './dto/update-participation.dto';

describe('ParticipationsController', () => {
    let controller: ParticipationsController;
    let participationsService: {
        create: jest.Mock<string, [CreateParticipationDto]>;
        findAll: jest.Mock<string, []>;
        findOne: jest.Mock<string, [number]>;
        update: jest.Mock<string, [number, UpdateParticipationDto]>;
        remove: jest.Mock<string, [number]>;
    };

    beforeEach(() => {
        participationsService = {
            create: jest.fn().mockReturnValue('created'),
            findAll: jest.fn().mockReturnValue('all'),
            findOne: jest.fn().mockReturnValue('one'),
            update: jest.fn().mockReturnValue('updated'),
            remove: jest.fn().mockReturnValue('removed'),
        };

        controller = new ParticipationsController(participationsService as unknown as ParticipationsService);
    });

    it('should create participation', () => {
        const dto: CreateParticipationDto = {};
        expect(controller.create(dto)).toBe('created');
        expect(participationsService.create).toHaveBeenCalledWith(dto);
    });

    it('should find all participations', () => {
        expect(controller.findAll()).toBe('all');
        expect(participationsService.findAll).toHaveBeenCalled();
    });

    it('should find one participation', () => {
        expect(controller.findOne('1')).toBe('one');
        expect(participationsService.findOne).toHaveBeenCalledWith(1);
    });

    it('should update participation', () => {
        const dto: UpdateParticipationDto = {};
        expect(controller.update('1', dto)).toBe('updated');
        expect(participationsService.update).toHaveBeenCalledWith(1, dto);
    });

    it('should remove participation', () => {
        expect(controller.remove('1')).toBe('removed');
        expect(participationsService.remove).toHaveBeenCalledWith(1);
    });
});

