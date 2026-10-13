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

import { AnnouncementImagesController } from './announcement-images.controller';
import { AnnouncementsService } from './announcements.service';
import { CreateImageDto } from '../media/image/dto/create-image.dto';
import { Image } from '../media/entities/image.entity';

describe('AnnouncementImagesController', () => {
    let controller: AnnouncementImagesController;
    let announcementsService: jest.Mocked<AnnouncementsService>;

    const mockImage: Image = {
        id: 1,
        image_url: 'https://img.jpg',
        cause_id: null,
        announcement_id: 1,
        created_at: new Date(),
    } as unknown as Image;

    beforeEach(() => {
        announcementsService = {
            addImage: jest.fn(),
            findImagesByAnnouncement: jest.fn(),
        } as unknown as jest.Mocked<AnnouncementsService>;

        controller = new AnnouncementImagesController(announcementsService);
    });

    describe('create', () => {
        it('should add an image to an announcement', async () => {
            const dto: CreateImageDto = { image_url: 'https://img.jpg' };
            const user = { id: 1, role: 'organizer' };
            announcementsService.addImage.mockResolvedValue(mockImage);

            const result = await controller.create(1, user, dto);

            expect(result).toEqual(mockImage);
            expect(announcementsService.addImage).toHaveBeenCalledWith(1, user, dto);
        });
    });

    describe('findAll', () => {
        it('should return images for an announcement', async () => {
            announcementsService.findImagesByAnnouncement.mockResolvedValue([mockImage]);

            const result = await controller.findAll(1);

            expect(result).toEqual([mockImage]);
            expect(announcementsService.findImagesByAnnouncement).toHaveBeenCalledWith(1);
        });
    });
});
