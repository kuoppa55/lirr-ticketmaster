jest.mock('@react-native-async-storage/async-storage', () => {
    const store = new Map();
    return {
        getItem: jest.fn(async (key) => (store.has(key) ? store.get(key) : null)),
        setItem: jest.fn(async (key, value) => {
            store.set(key, value);
        }),
        removeItem: jest.fn(async (key) => {
            store.delete(key);
        }),
        multiRemove: jest.fn(async (keys) => {
            keys.forEach((key) => store.delete(key));
        }),
        __store: store,
    };
});

describe('storage service', () => {
    let originalDateNow;

    beforeEach(() => {
        const AsyncStorage = require('@react-native-async-storage/async-storage');
        AsyncStorage.__store.clear();
        originalDateNow = Date.now;
    });

    afterEach(() => {
        Date.now = originalDateNow;
        jest.resetModules();
    });

    test('getUserSettings clamps and normalizes persisted settings', async () => {
        const AsyncStorage = require('@react-native-async-storage/async-storage');
        const { STORAGE_KEYS } = require('../src/constants');

        await AsyncStorage.setItem(
            STORAGE_KEYS.USER_SETTINGS,
            JSON.stringify({
                geofenceRadiusMeters: 999999,
                dwellTimeMs: -10,
                cooldownMs: 'oops',
                useMetric: 'yes',
                notificationPrivacyMode: 1,
            })
        );

        const { getUserSettings } = require('../src/services/storage');
        const settings = await getUserSettings();

        expect(settings.geofenceRadiusMeters).toBe(2000);
        expect(settings.dwellTimeMs).toBe(15000);
        expect(settings.cooldownMs).toBe(5400000);
        expect(settings.useMetric).toBe(true);
        expect(settings.notificationPrivacyMode).toBe(true);
    });

    test('cooldown checks boundary correctly', async () => {
        const { setLastNotificationTime, isInCooldown, getUserSettings } = require('../src/services/storage');
        const { saveUserSettings } = require('../src/services/storage');

        const base = await getUserSettings();
        await saveUserSettings({ ...base, cooldownMs: 600000 });

        await setLastNotificationTime(Date.now() - 30000);
        expect(await isInCooldown()).toBe(true);

        await setLastNotificationTime(Date.now() - 700000);
        expect(await isInCooldown()).toBe(false);
    });

    test('cooldown timestamp is global (not station-scoped)', async () => {
        const AsyncStorage = require('@react-native-async-storage/async-storage');
        const { STORAGE_KEYS } = require('../src/constants');
        const { setLastNotificationTime } = require('../src/services/storage');

        await setLastNotificationTime(1234567890);

        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
            STORAGE_KEYS.LAST_NOTIFICATION_TIME,
            '1234567890'
        );
        expect(AsyncStorage.__store.has(`${STORAGE_KEYS.LAST_NOTIFICATION_TIME}:station-a`)).toBe(false);
        expect(AsyncStorage.__store.has(`${STORAGE_KEYS.LAST_NOTIFICATION_TIME}:station-b`)).toBe(false);
    });

    test('pending dwell timers are filtered to active timers only', async () => {
        const AsyncStorage = require('@react-native-async-storage/async-storage');
        const { STORAGE_KEYS } = require('../src/constants');
        const { getPendingDwellTimers } = require('../src/services/storage');

        Date.now = jest.fn(() => 1000000);
        await AsyncStorage.setItem(
            STORAGE_KEYS.PENDING_DWELL_TIMERS,
            JSON.stringify({
                activeStation: {
                    stationId: 'activeStation',
                    stationName: 'Active',
                    startedAt: 999000,
                    expiresAt: 1005000,
                },
                expiredStation: {
                    stationId: 'expiredStation',
                    stationName: 'Expired',
                    startedAt: 900000,
                    expiresAt: 999999,
                },
            })
        );

        const timers = await getPendingDwellTimers();

        expect(Object.keys(timers)).toEqual(['activeStation']);
        expect(timers.activeStation.stationName).toBe('Active');
    });

    test('add and remove pending dwell timer persist state', async () => {
        const { addPendingDwellTimer, removePendingDwellTimer, getPendingDwellTimers } = require('../src/services/storage');

        Date.now = jest.fn(() => 2000000);
        const timer = await addPendingDwellTimer('station-a', 'Station A');

        expect(timer.stationId).toBe('station-a');
        let timers = await getPendingDwellTimers();
        expect(timers['station-a']).toBeDefined();

        await removePendingDwellTimer('station-a');
        timers = await getPendingDwellTimers();
        expect(timers['station-a']).toBeUndefined();
    });

    test('clearAllData removes persisted keys and clears caches', async () => {
        const AsyncStorage = require('@react-native-async-storage/async-storage');
        const { STORAGE_KEYS } = require('../src/constants');
        const {
            saveUserSettings,
            saveSelectedStations,
            setOnboardingComplete,
            setLastNotificationTime,
            addPendingDwellTimer,
            clearAllData,
            getUserSettings,
            getSelectedStations,
            getPendingDwellTimers,
        } = require('../src/services/storage');

        await saveUserSettings({ geofenceRadiusMeters: 400 });
        await saveSelectedStations(['station-a']);
        await setOnboardingComplete();
        await setLastNotificationTime(123456);
        await addPendingDwellTimer('station-a', 'Station A');

        await clearAllData();

        expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
            STORAGE_KEYS.SELECTED_STATIONS,
            STORAGE_KEYS.ONBOARDING_COMPLETE,
            STORAGE_KEYS.LAST_NOTIFICATION_TIME,
            STORAGE_KEYS.PENDING_DWELL_TIMERS,
            STORAGE_KEYS.USER_SETTINGS,
        ]);
        expect(await getSelectedStations()).toEqual([]);
        expect(await getPendingDwellTimers()).toEqual({});
        expect((await getUserSettings()).geofenceRadiusMeters).toBe(300);
    });

    test('reconcileRuntimeState returns active pending timer count', async () => {
        const { addPendingDwellTimer, reconcileRuntimeState } = require('../src/services/storage');

        Date.now = jest.fn(() => 500000);
        await addPendingDwellTimer('station-a', 'Station A');

        const summary = await reconcileRuntimeState();
        expect(summary).toEqual({ activeTimerCount: 1 });
    });
});
