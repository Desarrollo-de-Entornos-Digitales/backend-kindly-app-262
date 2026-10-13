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

import { AnnouncementLikesController } from './announcement-likes.controller';
import { AnnouncementsService } from './announcements.service';

describe('AnnouncementLikesController', () => {
    let controller: AnnouncementLikesController;
    let announcementsService: jest.Mocked<AnnouncementsService>;

    beforeEach(() => {
        announcementsService = {
            like: jest.fn(),
        } as unknown as jest.Mocked<AnnouncementsService>;

        controller = new AnnouncementLikesController(announcementsService);
    });

    describe('like', () => {
        it('should toggle like reaction on an announcement', async () => {
            const user = { id: 1, role: 'volunteer' };
            const likeResponse = { liked: true, totalLikes: 5 };
            announcementsService.like.mockResolvedValue(likeResponse as never);

            const result = await controller.like(1, user);

            expect(result).toEqual(likeResponse);
            expect(announcementsService.like).toHaveBeenCalledWith(1, user);
        });
    });
});
