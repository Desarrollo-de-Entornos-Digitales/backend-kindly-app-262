import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NearbyCausesQueryDto } from './nearby-causes-query.dto';

describe('NearbyCausesQueryDto', () => {
    it('should transform and validate valid coordinates and radius', async () => {
        const plain = {
            lat: '6.2442',
            lng: '-75.5812',
            radius_km: '15.5',
        };

        const dto = plainToInstance(NearbyCausesQueryDto, plain);
        const errors = await validate(dto);

        expect(errors.length).toBe(0);
        expect(dto.lat).toBe(6.2442);
        expect(dto.lng).toBe(-75.5812);
        expect(dto.radius_km).toBe(15.5);
    });

    it('should validate without optional radius_km', async () => {
        const plain = {
            lat: '4.6097',
            lng: '-74.0817',
        };

        const dto = plainToInstance(NearbyCausesQueryDto, plain);
        const errors = await validate(dto);

        expect(errors.length).toBe(0);
        expect(dto.radius_km).toBeUndefined();
    });

    it('should fail when lat or lng are outside valid boundaries', async () => {
        const plain = {
            lat: '95',
            lng: '-185',
        };

        const dto = plainToInstance(NearbyCausesQueryDto, plain);
        const errors = await validate(dto);

        expect(errors.length).toBe(2);
    });

    it('should fail when radius_km is below minimum or above maximum', async () => {
        const plainTooSmall = { lat: '4.6', lng: '-74.0', radius_km: '0.05' };
        const errorsSmall = await validate(plainToInstance(NearbyCausesQueryDto, plainTooSmall));
        expect(errorsSmall.length).toBe(1);

        const plainTooLarge = { lat: '4.6', lng: '-74.0', radius_km: '150' };
        const errorsLarge = await validate(plainToInstance(NearbyCausesQueryDto, plainTooLarge));
        expect(errorsLarge.length).toBe(1);
    });
});
