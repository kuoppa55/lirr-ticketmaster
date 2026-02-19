describe('stations selectors', () => {
    afterEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
    });

    test('iOS platform selection respects region limits and includes major junctions', () => {
        jest.doMock('react-native', () => ({
            Platform: { OS: 'ios' },
        }));

        let stations;
        let constants;
        jest.isolateModules(() => {
            stations = require('../src/data/stations');
            constants = require('../src/constants');
        });

        const userSelected = stations.LIRR_STATIONS.filter(
            (station) => !stations.MAJOR_JUNCTIONS.includes(station.identifier)
        )
            .slice(0, 30)
            .map((station) => station.identifier);

        const selected = stations.getStationsForPlatform(userSelected);
        expect(selected.length).toBeLessThanOrEqual(constants.IOS_MAX_REGIONS);
        expect(
            stations.MAJOR_JUNCTIONS.every((id) =>
                selected.some((station) => station.identifier === id)
            )
        ).toBe(true);
    });

    test('android selection includes all user selected and major stations', () => {
        jest.doMock('react-native', () => ({
            Platform: { OS: 'android' },
        }));

        let stations;
        jest.isolateModules(() => {
            stations = require('../src/data/stations');
        });

        const userSelected = stations.LIRR_STATIONS.slice(0, 15).map(
            (station) => station.identifier
        );
        const selected = stations.getStationsForPlatform(userSelected);

        expect(selected.length).toBeGreaterThanOrEqual(userSelected.length);
        expect(
            stations.MAJOR_JUNCTIONS.every((id) =>
                selected.some((station) => station.identifier === id)
            )
        ).toBe(true);
    });
});
