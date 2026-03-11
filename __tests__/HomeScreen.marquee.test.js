import { shouldResetMarquee } from '../src/screens/homeMarquee';

describe('HomeScreen marquee reset logic', () => {
    test('does not reset for distance-only updates while approaching', () => {
        expect(
            shouldResetMarquee({
                prevIsActive: true,
                nextIsActive: true,
                prevHasStations: true,
                nextHasStations: true,
            })
        ).toBe(false);
    });

    test('resets when monitoring is toggled', () => {
        expect(
            shouldResetMarquee({
                prevIsActive: false,
                nextIsActive: true,
                prevHasStations: false,
                nextHasStations: false,
            })
        ).toBe(true);

        expect(
            shouldResetMarquee({
                prevIsActive: true,
                nextIsActive: false,
                prevHasStations: true,
                nextHasStations: false,
            })
        ).toBe(true);
    });

    test('resets when transitioning between scanning and approaching', () => {
        expect(
            shouldResetMarquee({
                prevIsActive: true,
                nextIsActive: true,
                prevHasStations: false,
                nextHasStations: true,
            })
        ).toBe(true);

        expect(
            shouldResetMarquee({
                prevIsActive: true,
                nextIsActive: true,
                prevHasStations: true,
                nextHasStations: false,
            })
        ).toBe(true);
    });
});
