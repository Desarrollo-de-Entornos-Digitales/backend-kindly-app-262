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

import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { GetDeckQueryDto } from './dto/get-deck-query.dto';
import { CreateMatchDto } from './dto/create-match.dto';
import { DismissMatchDto } from './dto/dismiss-match.dto';

describe('MatchesController', () => {
    let controller: MatchesController;
    let matchesService: jest.Mocked<MatchesService>;

    beforeEach(() => {
        matchesService = {
            getDeck: jest.fn(),
            match: jest.fn(),
            dismiss: jest.fn(),
            getMapPins: jest.fn(),
            getCausePreview: jest.fn(),
            getForYouFeed: jest.fn(),
            getNearbyPins: jest.fn(),
            getPinsInArea: jest.fn(),
        } as unknown as jest.Mocked<MatchesService>;

        controller = new MatchesController(matchesService);
    });

    describe('getDeck', () => {
        it('should return matching deck for volunteer and query parameters', async () => {
            const user = { id: 1, role: 'volunteer' };
            const query: GetDeckQueryDto = { limit: 10, page: 1 };
            const deck = [{ cause: { id: 1, title: 'Cause 1' }, affinity_score: 85 }];
            matchesService.getDeck.mockResolvedValue(deck as never);

            const result = await controller.getDeck(user, query);

            expect(result).toEqual(deck);
            expect(matchesService.getDeck).toHaveBeenCalledWith(user, query);
        });
    });

    describe('match', () => {
        it('should record volunteer interest and return created submission match', async () => {
            const dto: CreateMatchDto = { cause_id: 1, justification: 'Interested' };
            const matchResult = { id: 1, status: 'pending', cause_id: 1 };
            matchesService.match.mockResolvedValue(matchResult as never);

            const result = await controller.match(10, dto);

            expect(result).toEqual(matchResult);
            expect(matchesService.match).toHaveBeenCalledWith(10, dto);
        });
    });

    describe('dismiss', () => {
        it('should dismiss cause for volunteer and return confirmation', async () => {
            const dto: DismissMatchDto = { cause_id: 1 };
            const dismissResult = { message: 'Cause dismissed successfully' };
            matchesService.dismiss.mockResolvedValue(dismissResult as never);

            const result = await controller.dismiss(10, dto);

            expect(result).toEqual(dismissResult);
            expect(matchesService.dismiss).toHaveBeenCalledWith(10, dto);
        });
    });

    describe('getMapPins', () => {
        it('should return map pins for available causes', async () => {
            const pins = [{ id: 1, title: 'Cause 1', latitude: '4.60', longitude: '-74.08' }];
            matchesService.getMapPins.mockResolvedValue(pins as never);

            const result = await controller.getMapPins();

            expect(result).toEqual(pins);
            expect(matchesService.getMapPins).toHaveBeenCalled();
        });
    });

    describe('getForYouFeed', () => {
        it('should return for you feed cards for current volunteer', async () => {
            const query: GetDeckQueryDto = { limit: 5, page: 1 };
            const cards = [{ id: 1, title: 'Cause 1', affinity_score: 1 }];
            matchesService.getForYouFeed.mockResolvedValue(cards as never);

            const result = await controller.getForYouFeed(10, query);

            expect(result).toEqual(cards);
            expect(matchesService.getForYouFeed).toHaveBeenCalledWith(10, query);
        });
    });

    describe('getNearbyPins', () => {
        it('should return nearby map pins with distances', async () => {
            const query = { lat: 4.6, lng: -74.08, radius_km: 15 };
            const pins = [{ id: 1, distance_km: 3.5 }];
            matchesService.getNearbyPins.mockResolvedValue(pins as never);

            const result = await controller.getNearbyPins(query);

            expect(result).toEqual(pins);
            expect(matchesService.getNearbyPins).toHaveBeenCalledWith(query);
        });
    });

    describe('getPinsInArea', () => {
        it('should return pins within bounding box', async () => {
            const query = { north: 5.0, south: 4.0, east: -73.0, west: -75.0 };
            const pins = [{ id: 1, latitude: 4.5, longitude: -74.0 }];
            matchesService.getPinsInArea.mockResolvedValue(pins as never);

            const result = await controller.getPinsInArea(query);

            expect(result).toEqual(pins);
            expect(matchesService.getPinsInArea).toHaveBeenCalledWith(query);
        });
    });

    describe('getCausePreview', () => {
        it('should return preview details for selected cause ID', async () => {
            const preview = { id: 1, title: 'Cause 1', description: 'Desc' };
            matchesService.getCausePreview.mockResolvedValue(preview as never);

            const result = await controller.getCausePreview(1);

            expect(result).toEqual(preview);
            expect(matchesService.getCausePreview).toHaveBeenCalledWith(1);
        });
    });
});
