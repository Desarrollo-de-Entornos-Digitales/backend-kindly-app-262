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
