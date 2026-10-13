import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';

describe('MediaService', () => {
    let service: MediaService;

    beforeEach(() => {
        service = new MediaService();
    });

    it('should create media', () => {
        const dto: CreateMediaDto = {};
        expect(service.create(dto)).toBe('This action adds a new media');
    });

    it('should return all media', () => {
        expect(service.findAll()).toBe('This action returns all media');
    });

    it('should return a single media by id', () => {
        expect(service.findOne(1)).toBe('This action returns a #1 media');
    });

    it('should update media by id', () => {
        const dto: UpdateMediaDto = {};
        expect(service.update(1, dto)).toBe('This action updates a #1 media');
    });

    it('should remove media by id', () => {
        expect(service.remove(1)).toBe('This action removes a #1 media');
    });
});

