import { Match } from './match.entity';

describe('Match Entity', () => {
    it('should be defined and instantiable', () => {
        const match = new Match();
        expect(match).toBeDefined();
        expect(match).toBeInstanceOf(Match);
    });
});

