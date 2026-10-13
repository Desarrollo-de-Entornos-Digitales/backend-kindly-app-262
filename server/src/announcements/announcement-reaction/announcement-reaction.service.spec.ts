import { AnnouncementReactionService } from './announcement-reaction.service';
import { CreateAnnouncementReactionDto } from './dto/create-announcement-reaction.dto';
import { UpdateAnnouncementReactionDto } from './dto/update-announcement-reaction.dto';

describe('AnnouncementReactionService', () => {
    let service: AnnouncementReactionService;

    beforeEach(() => {
        service = new AnnouncementReactionService();
    });

    it('should create an announcement reaction', () => {
        const dto: CreateAnnouncementReactionDto = {};
        expect(service.create(dto)).toBe('This action adds a new announcementReaction');
    });

    it('should return all announcement reactions', () => {
        expect(service.findAll()).toBe('This action returns all announcementReaction');
    });

    it('should return a single announcement reaction by id', () => {
        expect(service.findOne(1)).toBe('This action returns a #1 announcementReaction');
    });

    it('should update an announcement reaction by id', () => {
        const dto: UpdateAnnouncementReactionDto = {};
        expect(service.update(1, dto)).toBe('This action updates a #1 announcementReaction');
    });

    it('should remove an announcement reaction by id', () => {
        expect(service.remove(1)).toBe('This action removes a #1 announcementReaction');
    });
});

