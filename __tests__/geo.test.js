import {
    calculateDistance,
    findNearbyGeofences,
    isInsideGeofence,
} from '../src/utils/geo';

describe('geo utils', () => {
    test('calculateDistance returns near-zero for same coordinate', () => {
        expect(calculateDistance(40.75, -73.99, 40.75, -73.99)).toBeCloseTo(0);
    });

    test('isInsideGeofence checks radius boundary', () => {
        expect(isInsideGeofence(40.75, -73.99, 40.75, -73.99, 100)).toBe(true);
        expect(isInsideGeofence(40.75, -73.99, 40.85, -73.99, 100)).toBe(false);
    });

    test('findNearbyGeofences sorts by distance and marks inside', () => {
        const regions = [
            {
                identifier: 'far',
                name: 'Far',
                latitude: 41,
                longitude: -74,
                radius: 300,
            },
            {
                identifier: 'near',
                name: 'Near',
                latitude: 40.7501,
                longitude: -73.9901,
                radius: 300,
            },
        ];

        const nearby = findNearbyGeofences(40.75, -73.99, regions);
        expect(nearby[0].identifier).toBe('near');
        expect(nearby[0].isInside).toBe(true);
        expect(nearby[1].identifier).toBe('far');
    });
});
