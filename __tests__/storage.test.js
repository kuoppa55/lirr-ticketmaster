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
    beforeEach(() => {
        const AsyncStorage = require('@react-native-async-storage/async-storage');
        AsyncStorage.__store.clear();
    });

    afterEach(() => {
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
});
