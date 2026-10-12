const EARTH_RADIUS_KM = 6371;

export interface Coordinates {
    latitude: number;
    longitude: number;
}

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

export function distanceInKm(from: Coordinates, to: Coordinates): number {
    const deltaLatitude = toRadians(to.latitude - from.latitude);
    const deltaLongitude = toRadians(to.longitude - from.longitude);

    const a =
        Math.sin(deltaLatitude / 2) ** 2 +
        Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(deltaLongitude / 2) ** 2;

    return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
