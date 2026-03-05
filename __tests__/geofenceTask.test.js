function flushPromises() {
    return Promise.resolve().then(() => Promise.resolve());
}

function setupTaskModule({
    stationName = 'Penn Station',
    sendTicketReminderImpl,
} = {}) {
    jest.resetModules();

    const defineTask = jest.fn();
    const sendTicketReminder = jest.fn(
        sendTicketReminderImpl || (async () => 'notification-id')
    );
    const findStationById = jest.fn(() => ({ name: stationName }));
    const isInCooldown = jest.fn(async () => false);
    const setLastNotificationTime = jest.fn(async () => true);
    const captureEvent = jest.fn(async () => undefined);
    const getTelemetryContext = jest.fn(() => ({ sessionId: 'session-1' }));
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
    }));
    jest.doMock('../src/services/telemetry', () => ({
        captureEvent,
        getTelemetryContext,
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
            captureEvent,
            getTelemetryContext,
            logger,
        },
    };
}

describe('geofence background task', () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    test('enter sends notification immediately when cooldown is inactive', async () => {
        const { handler, mocks } = setupTaskModule();

        await handler({
            data: {
                eventType: 1,
                region: { identifier: 'station-a' },
            },
        });

        expect(mocks.isInCooldown).toHaveBeenCalledTimes(1);
        expect(mocks.sendTicketReminder).toHaveBeenCalledWith('Penn Station');
        expect(mocks.setLastNotificationTime).toHaveBeenCalledTimes(1);
    });

    test('duplicate enter for same station is ignored while first enter is still processing', async () => {
        let resolveSend;
        const sendPromise = new Promise((resolve) => {
            resolveSend = resolve;
        });
        const { handler, mocks } = setupTaskModule({
            sendTicketReminderImpl: () => sendPromise,
        });

        const firstEnter = handler({
            data: {
                eventType: 1,
                region: { identifier: 'station-a' },
            },
        });
        await flushPromises();

        await handler({
            data: {
                eventType: 1,
                region: { identifier: 'station-a' },
            },
        });

        expect(mocks.sendTicketReminder).toHaveBeenCalledTimes(1);

        resolveSend('notification-id');
        await firstEnter;
    });

    test('global cooldown suppresses notifications across stations', async () => {
        const { handler, mocks } = setupTaskModule();

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

        await handler({
            data: {
                eventType: 1,
                region: { identifier: 'station-b' },
            },
        });

        expect(mocks.sendTicketReminder).toHaveBeenCalledTimes(1);
        expect(mocks.sendTicketReminder).toHaveBeenCalledWith('Station A');
        expect(mocks.setLastNotificationTime).toHaveBeenCalledTimes(1);
    });

    test('exit event does not trigger notification work', async () => {
        const { handler, mocks } = setupTaskModule();

        await handler({
            data: {
                eventType: 2,
                region: { identifier: 'station-a' },
            },
        });

        expect(mocks.sendTicketReminder).not.toHaveBeenCalled();
        expect(mocks.setLastNotificationTime).not.toHaveBeenCalled();
    });

    test('missing region identifier is safely ignored', async () => {
        const { handler, mocks } = setupTaskModule();

        await handler({
            data: {
                eventType: 1,
                region: {},
            },
        });

        expect(mocks.isInCooldown).not.toHaveBeenCalled();
        expect(mocks.sendTicketReminder).not.toHaveBeenCalled();
        expect(mocks.logger.warn).toHaveBeenCalledTimes(1);
    });
});
