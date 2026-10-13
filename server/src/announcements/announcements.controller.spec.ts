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

import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { Announcement } from './entities/announcement.entity';

describe('AnnouncementsController', () => {
    let controller: AnnouncementsController;
    let announcementsService: jest.Mocked<AnnouncementsService>;

    const mockAnnouncement: Announcement = {
        id: 1,
        cause_id: 2,
        organizer_id: 1,
        title: 'Important Update',
        text: 'Meeting at 8am',
        created_at: new Date(),
        updated_at: new Date(),
    } as unknown as Announcement;

    beforeEach(() => {
        announcementsService = {
            create: jest.fn(),
            findAllByCause: jest.fn(),
        } as unknown as jest.Mocked<AnnouncementsService>;

        controller = new AnnouncementsController(announcementsService);
    });

    describe('create', () => {
        it('should create an announcement for a cause and user', async () => {
            const dto: CreateAnnouncementDto = { title: 'Important Update', text: 'Meeting at 8am' };
            const user = { id: 1, role: 'organizer' };
            announcementsService.create.mockResolvedValue(mockAnnouncement);

            const result = await controller.create(2, user, dto);

            expect(result).toEqual(mockAnnouncement);
            expect(announcementsService.create).toHaveBeenCalledWith(2, user, dto);
        });
    });

    describe('findAllByCause', () => {
        it('should return all announcements for a cause', async () => {
            announcementsService.findAllByCause.mockResolvedValue([mockAnnouncement]);

            const result = await controller.findAllByCause(2);

            expect(result).toEqual([mockAnnouncement]);
            expect(announcementsService.findAllByCause).toHaveBeenCalledWith(2);
        });
    });
});
