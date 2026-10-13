import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { QueryAchievementsDto } from './query-achievements.dto';

describe('QueryAchievementsDto', () => {
    it('should transform numeric strings to numbers and retain default values', async () => {
        const plain = {
            page: '5',
            limit: '30',
            search: 'achievement',
        };

        const dto = plainToInstance(QueryAchievementsDto, plain);
        const errors = await validate(dto);

        expect(errors.length).toBe(0);
        expect(dto.page).toBe(5);
        expect(dto.limit).toBe(30);
        expect(dto.search).toBe('achievement');
    });

    it('should use default values when omitted', () => {
        const dto = new QueryAchievementsDto();
        expect(dto.page).toBe(1);
        expect(dto.limit).toBe(10);
    });
});

