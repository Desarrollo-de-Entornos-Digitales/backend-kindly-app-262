import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { GetDeckQueryDto } from './get-deck-query.dto';

describe('GetDeckQueryDto', () => {
    it('should transform numeric strings to numbers within range', async () => {
        const plain = {
            limit: '25',
            page: '3',
        };

        const dto = plainToInstance(GetDeckQueryDto, plain);
        const errors = await validate(dto);

        expect(errors.length).toBe(0);
        expect(dto.limit).toBe(25);
        expect(dto.page).toBe(3);
    });

    it('should fail validation when limit exceeds 50', async () => {
        const plain = {
            limit: '55',
        };

        const dto = plainToInstance(GetDeckQueryDto, plain);
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail validation when page or limit is less than 1', async () => {
        const plain = {
            limit: '0',
            page: '-1',
        };

        const dto = plainToInstance(GetDeckQueryDto, plain);
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThanOrEqual(2);
    });
});

