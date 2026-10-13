import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { MapAreaQueryDto } from './map-area-query.dto';

describe('MapAreaQueryDto', () => {
    it('should transform and validate valid bounding box coordinates', async () => {
        const plain = {
            north: '7.5',
            south: '5.2',
            east: '-73.1',
            west: '-76.0',
        };

        const dto = plainToInstance(MapAreaQueryDto, plain);
        const errors = await validate(dto);

        expect(errors.length).toBe(0);
        expect(dto.north).toBe(7.5);
        expect(dto.south).toBe(5.2);
        expect(dto.east).toBe(-73.1);
        expect(dto.west).toBe(-76.0);
    });

    it('should fail when north or south exceed latitude boundaries', async () => {
        const plain = {
            north: '95',
            south: '-95',
            east: '0',
            west: '0',
        };

        const dto = plainToInstance(MapAreaQueryDto, plain);
        const errors = await validate(dto);

        expect(errors.length).toBe(2);
    });

    it('should fail when east or west exceed longitude boundaries', async () => {
        const plain = {
            north: '10',
            south: '5',
            east: '185',
            west: '-190',
        };

        const dto = plainToInstance(MapAreaQueryDto, plain);
        const errors = await validate(dto);

        expect(errors.length).toBe(2);
    });
});
