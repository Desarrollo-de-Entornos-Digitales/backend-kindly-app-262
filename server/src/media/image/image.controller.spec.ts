import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { CreateImageDto } from './dto/create-image.dto';
import { Image } from '../entities/image.entity';

describe('ImageController', () => {
    let controller: ImageController;
    let imageService: jest.Mocked<ImageService>;

    const mockImage: Image = {
        id: 1,
        image_url: 'https://img.jpg',
        cause_id: 2,
        announcement_id: null,
        created_at: new Date(),
    } as unknown as Image;

    beforeEach(() => {
        imageService = {
            create: jest.fn(),
            findAllByCause: jest.fn(),
            remove: jest.fn(),
        } as unknown as jest.Mocked<ImageService>;

        controller = new ImageController(imageService);
    });

    describe('create', () => {
        it('should create gallery image for cause and organizer', async () => {
            const dto: CreateImageDto = { image_url: 'https://img.jpg' };
            imageService.create.mockResolvedValue(mockImage);

            const result = await controller.create(2, 1, dto);

            expect(result).toEqual(mockImage);
            expect(imageService.create).toHaveBeenCalledWith(2, 1, dto);
        });
    });

    describe('findAll', () => {
        it('should return all gallery images for cause', async () => {
            imageService.findAllByCause.mockResolvedValue([mockImage]);

            const result = await controller.findAll(2);

            expect(result).toEqual([mockImage]);
            expect(imageService.findAllByCause).toHaveBeenCalledWith(2);
        });
    });

    describe('remove', () => {
        it('should remove image from cause', async () => {
            imageService.remove.mockResolvedValue({ message: 'Image deleted successfully' });

            const result = await controller.remove(2, 1, 1);

            expect(result).toEqual({ message: 'Image deleted successfully' });
            expect(imageService.remove).toHaveBeenCalledWith(2, 1, 1);
        });
    });
});
