import { CauseService } from './cause.service';
import { CreateCauseDto } from './dto/create-cause.dto';
import { UpdateCauseDto } from './dto/update-cause.dto';

describe('CauseService', () => {
    let service: CauseService;

    beforeEach(() => {
        service = new CauseService();
    });

    it('should create a cause', () => {
        const dto: CreateCauseDto = {};
        expect(service.create(dto)).toBe('This action adds a new cause');
    });

    it('should return all causes', () => {
        expect(service.findAll()).toBe('This action returns all cause');
    });

    it('should return a single cause by id', () => {
        expect(service.findOne(1)).toBe('This action returns a #1 cause');
    });

    it('should update a cause by id', () => {
        const dto: UpdateCauseDto = {};
        expect(service.update(1, dto)).toBe('This action updates a #1 cause');
    });

    it('should remove a cause by id', () => {
        expect(service.remove(1)).toBe('This action removes a #1 cause');
    });
});

