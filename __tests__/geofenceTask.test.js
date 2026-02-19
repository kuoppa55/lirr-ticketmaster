function flushPromises() {
    return Promise.resolve().then(() => Promise.resolve());
}

function setupTaskModule({
    dwellTimeMs = 1000,
    stationName = 'Penn Station',
} = {}) {
    jest.resetModules();

    const defineTask = jest.fn();
    const sendTicketReminder = jest.fn(async () => 'notification-id');
    const findStationById = jest.fn(() => ({ name: stationName }));
    const isInCooldown = jest.fn(async () => false);
    const setLastNotificationTime = jest.fn(async () => true);
    const addPendingDwellTimer = jest.fn(async () => ({
        stationId: 'station-a',
        stationName,
    }));
    const removePendingDwellTimer = jest.fn(async () => true);
    const getUserSettings = jest.fn(async () => ({ dwellTimeMs }));
    const logger = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    };

    jest.doMock('expo-task-manager', () => ({
        defineTask,
    }));
    jest.doMock('expo-location', () => ({
        GeofencingEventType: {
            Enter: 1,
            Exit: 2,
        },
    }));
    jest.doMock('../src/data/stations', () => ({
        findStationById,
    }));
    jest.doMock('../src/services/notifications', () => ({
        sendTicketReminder,
    }));
    jest.doMock('../src/services/storage', () => ({
        isInCooldown,
        setLastNotificationTime,
        addPendingDwellTimer,
        removePendingDwellTimer,
        getUserSettings,
    }));
    jest.doMock('../src/utils/logger', () => ({
        logger,
    }));

    require('../src/background/geofenceTask');

    const handler = defineTask.mock.calls[0][1];

    return {
        handler,
        mocks: {
            sendTicketReminder,
            findStationById,
            isInCooldown,
            setLastNotificationTime,
            addPendingDwellTimer,
            removePendingDwellTimer,
            getUserSettings,
            logger,
        },
    };
}

describe('geofence background task', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
        jest.resetModules();
    });

    test('enter schedules a single dwell timer and sends notification', async () => {
        const { handler, mocks } = setupTaskModule({ dwellTimeMs: 1000 });

        await handler({
            data: {
                eventType: 1,
                region: { identifier: 'station-a' },
            },
        });

        expect(mocks.addPendingDwellTimer).toHaveBeenCalledWith(
            'station-a',
            'Penn Station'
        );

        jest.advanceTimersByTime(1000);
        await flushPromises();

        expect(mocks.sendTicketReminder).toHaveBeenCalledWith('Penn Station');
        expect(mocks.setLastNotificationTime).toHaveBeenCalledTimes(1);
        expect(mocks.removePendingDwellTimer).toHaveBeenCalledWith('station-a');
    });

    test('duplicate enter for same station is ignored while timer is active', async () => {
        const { handler, mocks } = setupTaskModule({ dwellTimeMs: 2000 });

        await handler({
            data: {
                eventType: 1,
                region: { identifier: 'station-a' },
            },
        });
        await handler({
            data: {
                eventType: 1,
                region: { identifier: 'station-a' },
            },
        });

        expect(mocks.addPendingDwellTimer).toHaveBeenCalledTimes(1);
        expect(mocks.getUserSettings).toHaveBeenCalledTimes(1);
    });

    test('exit clears pending timer and prevents notification', async () => {
        const { handler, mocks } = setupTaskModule({ dwellTimeMs: 1000 });

        await handler({
            data: {
                eventType: 1,
                region: { identifier: 'station-a' },
            },
        });
        await handler({
            data: {
                eventType: 2,
                region: { identifier: 'station-a' },
            },
        });

        jest.advanceTimersByTime(1000);
        await flushPromises();

        expect(mocks.sendTicketReminder).not.toHaveBeenCalled();
        expect(mocks.removePendingDwellTimer).toHaveBeenCalledWith('station-a');
    });

    test('global cooldown suppresses notifications across stations', async () => {
        const { handler, mocks } = setupTaskModule({ dwellTimeMs: 1000 });

        mocks.findStationById
            .mockImplementationOnce(() => ({ name: 'Station A' }))
            .mockImplementationOnce(() => ({ name: 'Station B' }));
        mocks.isInCooldown
            .mockImplementationOnce(async () => false)
            .mockImplementationOnce(async () => true);

        await handler({
            data: {
                eventType: 1,
                region: { identifier: 'station-a' },
            },
        });
        jest.advanceTimersByTime(1000);
        await flushPromises();

        await handler({
            data: {
                eventType: 1,
                region: { identifier: 'station-b' },
            },
        });
        jest.advanceTimersByTime(1000);
        await flushPromises();

        expect(mocks.sendTicketReminder).toHaveBeenCalledTimes(1);
        expect(mocks.sendTicketReminder).toHaveBeenCalledWith('Station A');
        expect(mocks.setLastNotificationTime).toHaveBeenCalledTimes(1);
    });

    test('missing region identifier is safely ignored', async () => {
        const { handler, mocks } = setupTaskModule();

        await handler({
            data: {
                eventType: 1,
                region: {},
            },
        });

        expect(mocks.addPendingDwellTimer).not.toHaveBeenCalled();
        expect(mocks.sendTicketReminder).not.toHaveBeenCalled();
        expect(mocks.logger.warn).toHaveBeenCalledTimes(1);
    });
});
