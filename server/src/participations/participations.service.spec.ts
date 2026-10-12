import { ParticipationsService } from './participations.service';
import { CreateParticipationDto } from './dto/create-participation.dto';
import { UpdateParticipationDto } from './dto/update-participation.dto';

describe('ParticipationsService', () => {
    let service: ParticipationsService;

    beforeEach(() => {
        service = new ParticipationsService();
    });

    it('should create participation', () => {
        const dto: CreateParticipationDto = {};
        expect(service.create(dto)).toBe('This action adds a new participation');
    });

    it('should return all participations', () => {
        expect(service.findAll()).toBe('This action returns all participations');
    });

    it('should return a single participation by id', () => {
        expect(service.findOne(1)).toBe('This action returns a #1 participation');
    });

    it('should update participation by id', () => {
        const dto: UpdateParticipationDto = {};
        expect(service.update(1, dto)).toBe('This action updates a #1 participation');
    });

    it('should remove participation by id', () => {
        expect(service.remove(1)).toBe('This action removes a #1 participation');
    });
});

