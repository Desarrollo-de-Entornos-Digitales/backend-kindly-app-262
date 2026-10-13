import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cause } from '../causes/entities/cause.entity';
import { Volunteer } from '../volunteers/entities/volunteer.entity';
import { Submission } from '../participations/entities/submission.entity';
import { SubmissionService } from '../participations/submission/submission.service';
import { MatchesService } from './matches.service';
import { NearbyCausesQueryDto } from './dto/nearby-causes-query.dto';
import { MapAreaQueryDto } from './dto/map-area-query.dto';

const causeAt = (id: number, latitude: string, longitude: string) =>
    ({ id, title: `Cause ${id}`, location_latitude: latitude, location_longitude: longitude }) as Cause;

describe('Map navigation', () => {
    let service: MatchesService;
    const queryBuilder = {
        leftJoinAndSelect: jest.fn(() => queryBuilder),
        where: jest.fn(() => queryBuilder),
        andWhere: jest.fn(() => queryBuilder),
        orderBy: jest.fn(() => queryBuilder),
        getMany: jest.fn<() => Promise<Cause[]>>(),
    };
    const causeRepository = {
        createQueryBuilder: jest.fn(() => queryBuilder),
    };

    const cali = { lat: 3.4516, lng: -76.532 };
    const caliCenter = causeAt(1, '3.4516', '-76.5320');
    const caliNorth = causeAt(2, '3.4950', '-76.5320');
    const jamundi = causeAt(3, '3.2610', '-76.5390');
    const bogota = causeAt(4, '4.7110', '-74.0721');

    beforeEach(async () => {
        jest.clearAllMocks();
        queryBuilder.getMany.mockResolvedValue([bogota, caliNorth, jamundi, caliCenter]);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MatchesService,
                { provide: getRepositoryToken(Cause), useValue: causeRepository },
                { provide: getRepositoryToken(Volunteer), useValue: {} },
                { provide: getRepositoryToken(Submission), useValue: {} },
                { provide: SubmissionService, useValue: {} },
            ],
        }).compile();

        service = module.get(MatchesService);
    });

    describe('getNearbyPins', () => {
        it('returns only the causes inside the radius, closest first', async () => {
            const pins = await service.getNearbyPins({ ...cali, radius_km: 10 });

            expect(pins.map((pin) => pin.id)).toEqual([1, 2]);
            expect(pins[0].distance_km).toBe(0);
            expect(pins[1].distance_km).toBeCloseTo(4.83, 1);
        });

        it('includes farther causes when the radius grows', async () => {
            const pins = await service.getNearbyPins({ ...cali, radius_km: 25 });
            expect(pins.map((pin) => pin.id)).toEqual([1, 2, 3]);
        });

        it('uses a 10 km radius by default', async () => {
            const pins = await service.getNearbyPins(cali);
            expect(pins.map((pin) => pin.id)).toEqual([1, 2]);
        });

        it('returns an empty list when no cause is close enough', async () => {
            const pins = await service.getNearbyPins({ lat: 6.2442, lng: -75.5812, radius_km: 5 });
            expect(pins).toEqual([]);
        });

        it('keeps the pin information from the map pins', async () => {
            const [pin] = await service.getNearbyPins({ ...cali, radius_km: 1 });
            expect(pin).toMatchObject({ id: 1, title: 'Cause 1', latitude: 3.4516, longitude: -76.532 });
        });
    });

    describe('getPinsInArea', () => {
        const caliArea = { north: 3.6, south: 3.3, east: -76.4, west: -76.7 };

        it('returns only the causes inside the visible area', async () => {
            const pins = await service.getPinsInArea(caliArea);
            expect(pins.map((pin) => pin.id).sort()).toEqual([1, 2]);
        });

        it('includes causes on the edge of the area', async () => {
            const pins = await service.getPinsInArea({ ...caliArea, north: 3.495 });
            expect(pins.map((pin) => pin.id).sort()).toEqual([1, 2]);
        });

        it('returns more causes when the area is zoomed out', async () => {
            const pins = await service.getPinsInArea({ north: 5, south: 3, east: -74, west: -77 });
            expect(pins.map((pin) => pin.id).sort()).toEqual([1, 2, 3, 4]);
        });

        it('supports areas that cross the antimeridian', async () => {
            queryBuilder.getMany.mockResolvedValue([
                causeAt(10, '0', '179.5'),
                causeAt(11, '0', '-179.5'),
                causeAt(12, '0', '0'),
            ]);
            const pins = await service.getPinsInArea({ north: 1, south: -1, east: -179, west: 179 });
            expect(pins.map((pin) => pin.id)).toEqual([10, 11]);
        });

        it('fails when south is greater than north', async () => {
            await expect(service.getPinsInArea({ ...caliArea, north: 3.3, south: 3.6 })).rejects.toThrow(
                BadRequestException,
            );
        });
    });

    describe('MapAreaQueryDto', () => {
        const pipe = new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true });
        const validate = (query: Record<string, string>) =>
            pipe.transform(query, { type: 'query', metatype: MapAreaQueryDto });

        it('converts the four borders to numbers', async () => {
            await expect(validate({ north: '3.6', south: '3.3', east: '-76.4', west: '-76.7' })).resolves.toEqual({
                north: 3.6,
                south: 3.3,
                east: -76.4,
                west: -76.7,
            });
        });

        it('requires all four borders', async () => {
            await expect(validate({ north: '3.6', south: '3.3', east: '-76.4' })).rejects.toThrow(BadRequestException);
        });

        it('rejects borders outside the valid range', async () => {
            await expect(validate({ north: '91', south: '0', east: '0', west: '0' })).rejects.toThrow(
                BadRequestException,
            );
            await expect(validate({ north: '1', south: '0', east: '181', west: '0' })).rejects.toThrow(
                BadRequestException,
            );
        });
    });

    describe('NearbyCausesQueryDto', () => {
        const pipe = new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true });
        const validate = (query: Record<string, string>) =>
            pipe.transform(query, { type: 'query', metatype: NearbyCausesQueryDto });

        it('converts query strings to numbers', async () => {
            await expect(validate({ lat: '3.45', lng: '-76.53', radius_km: '5' })).resolves.toEqual({
                lat: 3.45,
                lng: -76.53,
                radius_km: 5,
            });
        });

        it('requires lat and lng', async () => {
            await expect(validate({ lng: '-76.53' })).rejects.toThrow(BadRequestException);
            await expect(validate({ lat: '3.45' })).rejects.toThrow(BadRequestException);
        });

        it('rejects coordinates outside the valid range', async () => {
            await expect(validate({ lat: '91', lng: '0' })).rejects.toThrow(BadRequestException);
            await expect(validate({ lat: '0', lng: '-181' })).rejects.toThrow(BadRequestException);
        });

        it('rejects a radius outside the allowed range', async () => {
            await expect(validate({ lat: '0', lng: '0', radius_km: '0' })).rejects.toThrow(BadRequestException);
            await expect(validate({ lat: '0', lng: '0', radius_km: '101' })).rejects.toThrow(BadRequestException);
        });
    });
});
