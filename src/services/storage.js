/**
 * Storage service for LIRR Ticket Reminder App.
 * Handles persistent storage using AsyncStorage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, DEFAULT_SETTINGS, SETTINGS_LIMITS } from '../constants';
import { logger } from '../utils/logger';

let cachedUserSettings = null;
let cachedSelectedStations = null;

function getDefaultSettingsCopy() {
    return { ...DEFAULT_SETTINGS };
}

function clamp(value, min, max, fallback) {
    if (!Number.isFinite(value)) {
        return fallback;
    }
    if (value < min) return min;
    if (value > max) return max;
    return value;
}

function sanitizeSettings(rawSettings = {}) {
    const merged = {
        ...DEFAULT_SETTINGS,
        ...rawSettings,
    };

    return {
        geofenceRadiusMeters: clamp(
            Number(merged.geofenceRadiusMeters),
            SETTINGS_LIMITS.geofenceRadiusMeters.min,
            SETTINGS_LIMITS.geofenceRadiusMeters.max,
            DEFAULT_SETTINGS.geofenceRadiusMeters
        ),
        cooldownMs: clamp(
            Number(merged.cooldownMs),
            SETTINGS_LIMITS.cooldownMs.min,
            SETTINGS_LIMITS.cooldownMs.max,
            DEFAULT_SETTINGS.cooldownMs
        ),
        useMetric: Boolean(merged.useMetric),
        notificationPrivacyMode: Boolean(merged.notificationPrivacyMode),
    };
}

/**
 * Get user settings, merging with defaults for any missing keys.
 *
 * Returns:
 *     Settings object with all keys guaranteed.
 */
export async function getUserSettings() {
    if (cachedUserSettings) {
        return { ...cachedUserSettings };
    }

    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
        if (data) {
            cachedUserSettings = sanitizeSettings(JSON.parse(data));
            return { ...cachedUserSettings };
        }
        cachedUserSettings = getDefaultSettingsCopy();
        return { ...cachedUserSettings };
    } catch (error) {
        logger.error('Error loading user settings:', error);
        cachedUserSettings = getDefaultSettingsCopy();
        return { ...cachedUserSettings };
    }
}

/**
 * Save user settings to storage.
 *
 * Args:
 *     settings: Settings object to persist.
 *
 * Returns:
 *     True if save successful, false otherwise.
 */
export async function saveUserSettings(settings) {
    try {
        const mergedSettings = sanitizeSettings(settings);
        await AsyncStorage.setItem(
            STORAGE_KEYS.USER_SETTINGS,
            JSON.stringify(mergedSettings)
        );
        cachedUserSettings = mergedSettings;
        return true;
    } catch (error) {
        logger.error('Error saving user settings:', error);
        return false;
    }
}

/**
 * Save selected station IDs to storage.
 *
 * Args:
 *     stationIds: Array of station identifiers to save.
 *
 * Returns:
 *     True if save successful, false otherwise.
 */
export async function saveSelectedStations(stationIds) {
    try {
        const normalized = Array.isArray(stationIds) ? stationIds : [];
        await AsyncStorage.setItem(
            STORAGE_KEYS.SELECTED_STATIONS,
            JSON.stringify(normalized)
        );
        cachedSelectedStations = [...normalized];
        return true;
    } catch (error) {
        logger.error('Error saving selected stations:', error);
        return false;
    }
}

/**
 * Load selected station IDs from storage.
 *
 * Returns:
 *     Array of station identifiers, or empty array if none saved.
 */
export async function getSelectedStations() {
    if (cachedSelectedStations) {
        return [...cachedSelectedStations];
    }

    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_STATIONS);
        if (data) {
            cachedSelectedStations = JSON.parse(data);
            return [...cachedSelectedStations];
        }
        cachedSelectedStations = [];
        return [];
    } catch (error) {
        logger.error('Error loading selected stations:', error);
        return [];
    }
}

/**
 * Check if the user has completed onboarding.
 *
 * Returns:
 *     True if onboarding completed, false otherwise.
 */
export async function hasCompletedOnboarding() {
    try {
        const value = await AsyncStorage.getItem(
            STORAGE_KEYS.ONBOARDING_COMPLETE
        );
        return value === 'true';
    } catch (error) {
        logger.error('Error checking onboarding status:', error);
        return false;
    }
}

/**
 * Mark onboarding as complete.
 *
 * Returns:
 *     True if save successful, false otherwise.
 */
export async function setOnboardingComplete() {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
        return true;
    } catch (error) {
        logger.error('Error setting onboarding complete:', error);
        return false;
    }
}

/**
 * Get the timestamp of the last notification sent.
 *
 * Returns:
 *     Timestamp in milliseconds, or null if no notification sent.
 */
export async function getLastNotificationTime() {
    try {
        const value = await AsyncStorage.getItem(
            STORAGE_KEYS.LAST_NOTIFICATION_TIME
        );
        if (value) {
            return parseInt(value, 10);
        }
        return null;
    } catch (error) {
        logger.error('Error getting last notification time:', error);
        return null;
    }
}

/**
 * Set the timestamp of the last notification sent.
 *
 * Args:
 *     timestamp: Timestamp in milliseconds.
 *
 * Returns:
 *     True if save successful, false otherwise.
 */
export async function setLastNotificationTime(timestamp) {
    try {
        await AsyncStorage.setItem(
            STORAGE_KEYS.LAST_NOTIFICATION_TIME,
            timestamp.toString()
        );
        return true;
    } catch (error) {
        logger.error('Error setting last notification time:', error);
        return false;
    }
}

/**
 * Check if the global notification cooldown is active.
 * Reads the cooldown duration from user settings.
 *
 * Returns:
 *     True if in cooldown period, false otherwise.
 */
export async function isInCooldown() {
    try {
        const lastTime = await getLastNotificationTime();
        if (lastTime === null) {
            return false;
        }

        const settings = await getUserSettings();
        const elapsed = Date.now() - lastTime;
        return elapsed < settings.cooldownMs;
    } catch (error) {
        logger.error('Error checking cooldown:', error);
        return false;
    }
}

/**
 * Get the remaining cooldown time in milliseconds.
 * Reads the cooldown duration from user settings.
 *
 * Returns:
 *     Remaining time in milliseconds, or 0 if not in cooldown.
 */
export async function getRemainingCooldown() {
    try {
        const lastTime = await getLastNotificationTime();
        if (lastTime === null) {
            return 0;
        }

        const settings = await getUserSettings();
        const elapsed = Date.now() - lastTime;
        const remaining = settings.cooldownMs - elapsed;
        return remaining > 0 ? remaining : 0;
    } catch (error) {
        logger.error('Error getting remaining cooldown:', error);
        return 0;
    }
}

/**
 * Clear all stored data.
 * Useful for debugging or resetting the app.
 *
 * Returns:
 *     True if clear successful, false otherwise.
 */
export async function clearAllData() {
    try {
        await AsyncStorage.multiRemove([
            STORAGE_KEYS.SELECTED_STATIONS,
            STORAGE_KEYS.ONBOARDING_COMPLETE,
            STORAGE_KEYS.LAST_NOTIFICATION_TIME,
            STORAGE_KEYS.LEGACY_PENDING_DWELL_TIMERS,
            STORAGE_KEYS.USER_SETTINGS,
        ]);
        cachedUserSettings = null;
        cachedSelectedStations = null;
        return true;
    } catch (error) {
        logger.error('Error clearing data:', error);
        return false;
    }
}

/**
 * Reconcile persisted runtime state on app launch.
 * Cleans up legacy dwell timer state from older app versions.
 *
 * Returns:
 *     Object with counts of active timers.
 */
export async function reconcileRuntimeState() {
    try {
        const legacyData = await AsyncStorage.getItem(
            STORAGE_KEYS.LEGACY_PENDING_DWELL_TIMERS
        );
        const removedLegacyPendingTimers = Boolean(legacyData);
        if (removedLegacyPendingTimers) {
            await AsyncStorage.removeItem(STORAGE_KEYS.LEGACY_PENDING_DWELL_TIMERS);
        }

        return {
            removedLegacyPendingTimers,
        };
    } catch (error) {
        logger.error('Error reconciling runtime state:', error);
        return {
            removedLegacyPendingTimers: false,
        };
    }
}
