function setupNotificationsModule({ platformOs = 'ios' } = {}) {
    jest.resetModules();

    const notifications = {
        setNotificationHandler: jest.fn(),
        setNotificationChannelAsync: jest.fn(async () => true),
        getPermissionsAsync: jest.fn(),
        requestPermissionsAsync: jest.fn(),
        scheduleNotificationAsync: jest.fn(async () => 'notification-id'),
        cancelAllScheduledNotificationsAsync: jest.fn(async () => true),
        AndroidImportance: { MAX: 'max' },
        AndroidNotificationVisibility: { PRIVATE: 'private' },
        AndroidNotificationPriority: { HIGH: 'high' },
    };
    const getUserSettings = jest.fn();
    const logger = {
        warn: jest.fn(),
        info: jest.fn(),
        error: jest.fn(),
    };

    jest.doMock('expo-notifications', () => notifications);
    jest.doMock('react-native', () => ({
        Platform: { OS: platformOs },
    }));
    jest.doMock('../src/services/storage', () => ({
        getUserSettings,
    }));
    jest.doMock('../src/utils/logger', () => ({
        logger,
    }));

    const notificationService = require('../src/services/notifications');
    const { NOTIFICATION_CHANNEL_ID } = require('../src/constants');

    return {
        notificationService,
        channelId: NOTIFICATION_CHANNEL_ID,
        mocks: {
            notifications,
            getUserSettings,
            logger,
        },
    };
}

describe('notifications service', () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    test('requestNotificationPermissions returns true when already granted', async () => {
        const { notificationService, mocks } = setupNotificationsModule();
        mocks.notifications.getPermissionsAsync.mockResolvedValue({
            status: 'granted',
        });

        const granted =
            await notificationService.requestNotificationPermissions();

        expect(granted).toBe(true);
        expect(mocks.notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    });

    test('requestNotificationPermissions prompts when not already granted', async () => {
        const { notificationService, mocks } = setupNotificationsModule();
        mocks.notifications.getPermissionsAsync.mockResolvedValue({
            status: 'denied',
        });
        mocks.notifications.requestPermissionsAsync.mockResolvedValue({
            status: 'granted',
        });

        const granted =
            await notificationService.requestNotificationPermissions();

        expect(granted).toBe(true);
        expect(mocks.notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
    });

    test('setupNotificationChannel only creates Android channel on Android', async () => {
        const iosModule = setupNotificationsModule({ platformOs: 'ios' });
        await iosModule.notificationService.setupNotificationChannel();
        expect(
            iosModule.mocks.notifications.setNotificationChannelAsync
        ).not.toHaveBeenCalled();

        const androidModule = setupNotificationsModule({ platformOs: 'android' });
        await androidModule.notificationService.setupNotificationChannel();
        expect(
            androidModule.mocks.notifications.setNotificationChannelAsync
        ).toHaveBeenCalledWith(androidModule.channelId, expect.any(Object));
    });

    test('sendTicketReminder uses privacy-safe content when privacy mode enabled', async () => {
        const { notificationService, mocks } = setupNotificationsModule();
        mocks.getUserSettings.mockResolvedValue({
            notificationPrivacyMode: true,
        });

        await notificationService.sendTicketReminder('Jamaica');

        expect(mocks.notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
            content: expect.objectContaining({
                title: 'LIRR Ticket Reminder',
                body: 'You may be approaching a station. Open the app to view details.',
            }),
            trigger: null,
        });
    });

    test('sendTicketReminder falls back to non-privacy message if settings read fails', async () => {
        const { notificationService, mocks } = setupNotificationsModule();
        mocks.getUserSettings.mockRejectedValue(new Error('storage read failed'));

        await notificationService.sendTicketReminder('Jamaica');

        expect(mocks.notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
            content: expect.objectContaining({
                title: 'Activate Your LIRR Ticket!',
                body: expect.stringContaining("You're at Jamaica."),
            }),
            trigger: null,
        });
        expect(mocks.logger.warn).toHaveBeenCalledTimes(1);
    });

    test('sendTicketReminder includes channel id on Android payload', async () => {
        const { notificationService, channelId, mocks } = setupNotificationsModule({
            platformOs: 'android',
        });
        mocks.getUserSettings.mockResolvedValue({
            notificationPrivacyMode: false,
        });

        await notificationService.sendTicketReminder('Mineola');

        expect(mocks.notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
            content: expect.objectContaining({
                channelId,
            }),
            trigger: null,
        });
    });
});
