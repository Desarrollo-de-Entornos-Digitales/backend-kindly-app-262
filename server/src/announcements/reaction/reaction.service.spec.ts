import { ReactionService } from './reaction.service';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { UpdateReactionDto } from './dto/update-reaction.dto';

describe('ReactionService', () => {
    let service: ReactionService;

    beforeEach(() => {
        service = new ReactionService();
    });

    it('should create a reaction', () => {
        const dto: CreateReactionDto = {};
        expect(service.create(dto)).toBe('This action adds a new reaction');
    });

    it('should return all reactions', () => {
        expect(service.findAll()).toBe('This action returns all reaction');
    });

    it('should return a single reaction by id', () => {
        expect(service.findOne(1)).toBe('This action returns a #1 reaction');
    });

    it('should update a reaction by id', () => {
        const dto: UpdateReactionDto = {};
        expect(service.update(1, dto)).toBe('This action updates a #1 reaction');
    });

    it('should remove a reaction by id', () => {
        expect(service.remove(1)).toBe('This action removes a #1 reaction');
    });
});

