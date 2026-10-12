import { describe, it, expect } from '@jest/globals';
import { distanceInKm } from './geo.util';

describe('distanceInKm', () => {
    it('returns zero for the same point', () => {
        const point = { latitude: 3.4516, longitude: -76.532 };
        expect(distanceInKm(point, point)).toBe(0);
    });

    it('returns the distance between two cities', () => {
        const cali = { latitude: 3.4516, longitude: -76.532 };
        const bogota = { latitude: 4.711, longitude: -74.0721 };
        expect(distanceInKm(cali, bogota)).toBeCloseTo(306.67, 1);
    });

    it('returns the same distance in both directions', () => {
        const a = { latitude: 3.4516, longitude: -76.532 };
        const b = { latitude: 6.2442, longitude: -75.5812 };
        expect(distanceInKm(a, b)).toBeCloseTo(distanceInKm(b, a), 10);
    });

    it('handles points on opposite sides of the antimeridian', () => {
        const west = { latitude: 0, longitude: 179.5 };
        const east = { latitude: 0, longitude: -179.5 };
        expect(distanceInKm(west, east)).toBeCloseTo(111.2, 1);
    });
});
