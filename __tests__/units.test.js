import {
    feetToMeters,
    formatDistance,
    formatDuration,
    parseDurationInput,
    parseRadiusInput,
} from '../src/utils/units';

describe('units', () => {
    test('formats imperial and metric distance', () => {
        expect(formatDistance(304.8, false)).toBe('1000 ft');
        expect(formatDistance(1609.344, false)).toBe('1.0 mi');
        expect(formatDistance(300, true)).toBe('300 m');
        expect(formatDistance(1500, true)).toBe('1.5 km');
    });

    test('formats durations', () => {
        expect(formatDuration(30000)).toBe('30 seconds');
        expect(formatDuration(60000)).toBe('1 minute');
        expect(formatDuration(5400000)).toBe('1h 30m');
    });

    test('parses valid radius and duration inputs', () => {
        expect(parseRadiusInput('1000', false)).toBeCloseTo(feetToMeters(1000));
        expect(parseRadiusInput('300', true)).toBe(300);
        expect(parseDurationInput('30', 'seconds')).toBe(30000);
        expect(parseDurationInput('90', 'minutes')).toBe(5400000);
    });

    test('rejects out-of-range values', () => {
        expect(parseRadiusInput('10', false)).toBeNaN();
        expect(parseRadiusInput('9000', true)).toBeNaN();
        expect(parseDurationInput('0', 'minutes')).toBeNaN();
        expect(
            parseDurationInput('500', 'minutes', { minMs: 1, maxMs: 10000 })
        ).toBeNaN();
    });
});
