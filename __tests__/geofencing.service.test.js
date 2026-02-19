function setupGeofencingModule({
    platformOs = 'ios',
    platformVersion = 17,
} = {}) {
    jest.resetModules();

    const location = {
        getBackgroundPermissionsAsync: jest.fn(),
        getForegroundPermissionsAsync: jest.fn(),
        requestForegroundPermissionsAsync: jest.fn(),
        requestBackgroundPermissionsAsync: jest.fn(),
        startGeofencingAsync: jest.fn(),
        stopGeofencingAsync: jest.fn(),
    };
    const taskManager = {
        isTaskRegisteredAsync: jest.fn(),
        getTaskOptionsAsync: jest.fn(),
    };
    const getStationsForGeofencing = jest.fn();
    const getUserSettings = jest.fn();
    const logger = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    };

    jest.doMock('expo-location', () => location);
    jest.doMock('expo-task-manager', () => taskManager);
    jest.doMock('react-native', () => ({
        Platform: {
            OS: platformOs,
            Version: platformVersion,
        },
    }));
    jest.doMock('../src/data/stations', () => ({
        getStationsForGeofencing,
    }));
    jest.doMock('../src/services/storage', () => ({
        getUserSettings,
    }));
    jest.doMock('../src/utils/logger', () => ({
        logger,
    }));

    const geofencing = require('../src/services/geofencing');
    const { GEOFENCING_TASK_NAME } = require('../src/constants');

    return {
        geofencing,
        taskName: GEOFENCING_TASK_NAME,
        mocks: {
            location,
            taskManager,
            getStationsForGeofencing,
            getUserSettings,
        },
    };
}

describe('geofencing service', () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    test('startGeofencing returns false when background permission is denied', async () => {
        const { geofencing, mocks } = setupGeofencingModule();
        mocks.location.getBackgroundPermissionsAsync.mockResolvedValue({
            status: 'denied',
        });

        const started = await geofencing.startGeofencing(['a']);

        expect(started).toBe(false);
        expect(mocks.location.startGeofencingAsync).not.toHaveBeenCalled();
    });

    test('startGeofencing registers regions when prerequisites are met', async () => {
        const { geofencing, taskName, mocks } = setupGeofencingModule();
        mocks.location.getBackgroundPermissionsAsync.mockResolvedValue({
            status: 'granted',
        });
        mocks.taskManager.isTaskRegisteredAsync.mockResolvedValue(false);
        mocks.getUserSettings.mockResolvedValue({
            geofenceRadiusMeters: 300,
        });
        mocks.getStationsForGeofencing.mockReturnValue([
            {
                identifier: 'station-a',
                latitude: 40.7,
                longitude: -73.9,
                radius: 300,
            },
        ]);

        const started = await geofencing.startGeofencing(['station-a']);

        expect(started).toBe(true);
        expect(mocks.getStationsForGeofencing).toHaveBeenCalledWith(
            ['station-a'],
            300
        );
        expect(mocks.location.startGeofencingAsync).toHaveBeenCalledWith(
            taskName,
            expect.any(Array)
        );
    });

    test('startGeofencing returns false when there are no regions', async () => {
        const { geofencing, mocks } = setupGeofencingModule();
        mocks.location.getBackgroundPermissionsAsync.mockResolvedValue({
            status: 'granted',
        });
        mocks.taskManager.isTaskRegisteredAsync.mockResolvedValue(false);
        mocks.getUserSettings.mockResolvedValue({
            geofenceRadiusMeters: 300,
        });
        mocks.getStationsForGeofencing.mockReturnValue([]);

        const started = await geofencing.startGeofencing([]);

        expect(started).toBe(false);
        expect(mocks.location.startGeofencingAsync).not.toHaveBeenCalled();
    });

    test('stopGeofencing stops task when registered', async () => {
        const { geofencing, taskName, mocks } = setupGeofencingModule();
        mocks.taskManager.isTaskRegisteredAsync.mockResolvedValue(true);

        const stopped = await geofencing.stopGeofencing();

        expect(stopped).toBe(true);
        expect(mocks.location.stopGeofencingAsync).toHaveBeenCalledWith(taskName);
    });

    test('stopGeofencing is a no-op when not registered', async () => {
        const { geofencing, mocks } = setupGeofencingModule();
        mocks.taskManager.isTaskRegisteredAsync.mockResolvedValue(false);

        const stopped = await geofencing.stopGeofencing();

        expect(stopped).toBe(true);
        expect(mocks.location.stopGeofencingAsync).not.toHaveBeenCalled();
    });

    test('getRegisteredRegions returns empty array when geofencing inactive', async () => {
        const { geofencing, mocks } = setupGeofencingModule();
        mocks.taskManager.isTaskRegisteredAsync.mockResolvedValue(false);

        const regions = await geofencing.getRegisteredRegions();

        expect(regions).toEqual([]);
        expect(mocks.taskManager.getTaskOptionsAsync).not.toHaveBeenCalled();
    });

    test('getRegisteredRegions returns task regions when active', async () => {
        const { geofencing, taskName, mocks } = setupGeofencingModule();
        mocks.taskManager.isTaskRegisteredAsync.mockResolvedValue(true);
        mocks.taskManager.getTaskOptionsAsync.mockResolvedValue({
            regions: [{ identifier: 'station-a' }],
        });

        const regions = await geofencing.getRegisteredRegions();

        expect(mocks.taskManager.getTaskOptionsAsync).toHaveBeenCalledWith(taskName);
        expect(regions).toEqual([{ identifier: 'station-a' }]);
    });

    test('reconcileGeofencingState stops monitoring when background permission missing', async () => {
        const { geofencing, mocks } = setupGeofencingModule();
        mocks.location.getForegroundPermissionsAsync.mockResolvedValue({
            status: 'granted',
        });
        mocks.location.getBackgroundPermissionsAsync.mockResolvedValue({
            status: 'denied',
        });
        mocks.taskManager.isTaskRegisteredAsync.mockResolvedValue(true);

        const result = await geofencing.reconcileGeofencingState(['station-a']);

        expect(result).toEqual({
            active: false,
            reconciled: true,
            reason: 'background_permission_missing',
        });
        expect(mocks.location.stopGeofencingAsync).toHaveBeenCalledTimes(1);
    });

    test('reconcileGeofencingState restarts when active task has no regions', async () => {
        const { geofencing, taskName, mocks } = setupGeofencingModule();
        mocks.location.getForegroundPermissionsAsync.mockResolvedValue({
            status: 'granted',
        });
        mocks.location.getBackgroundPermissionsAsync.mockResolvedValue({
            status: 'granted',
        });
        mocks.taskManager.isTaskRegisteredAsync.mockResolvedValue(false);
        mocks.getUserSettings.mockResolvedValue({
            geofenceRadiusMeters: 300,
        });
        mocks.getStationsForGeofencing.mockReturnValue([
            {
                identifier: 'station-a',
                latitude: 40.7,
                longitude: -73.9,
                radius: 300,
            },
        ]);

        const result = await geofencing.reconcileGeofencingState(['station-a']);

        expect(result).toEqual({
            active: true,
            reconciled: true,
            reason: 'restarted',
        });
        expect(mocks.location.startGeofencingAsync).toHaveBeenCalledWith(
            taskName,
            expect.any(Array)
        );
    });
});
