import { AnnouncementService } from './announcement.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

describe('AnnouncementService', () => {
    let service: AnnouncementService;

    beforeEach(() => {
        service = new AnnouncementService();
    });

    it('should create an announcement', () => {
        const dto: CreateAnnouncementDto = {};
        expect(service.create(dto)).toBe('This action adds a new announcement');
    });

    it('should return all announcements', () => {
        expect(service.findAll()).toBe('This action returns all announcement');
    });

    it('should return a single announcement by id', () => {
        expect(service.findOne(1)).toBe('This action returns a #1 announcement');
    });

    it('should update an announcement by id', () => {
        const dto: UpdateAnnouncementDto = {};
        expect(service.update(1, dto)).toBe('This action updates a #1 announcement');
    });

    it('should remove an announcement by id', () => {
        expect(service.remove(1)).toBe('This action removes a #1 announcement');
    });
});

