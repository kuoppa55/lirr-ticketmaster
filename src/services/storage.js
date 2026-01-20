/**
 * Storage service for LIRR Ticket Reminder App.
 * Handles persistent storage using AsyncStorage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, GLOBAL_COOLDOWN_MS } from '../constants';

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
        await AsyncStorage.setItem(
            STORAGE_KEYS.SELECTED_STATIONS,
            JSON.stringify(stationIds)
        );
        return true;
    } catch (error) {
        console.error('Error saving selected stations:', error);
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
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_STATIONS);
        if (data) {
            return JSON.parse(data);
        }
        return [];
    } catch (error) {
        console.error('Error loading selected stations:', error);
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
        console.error('Error checking onboarding status:', error);
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
        console.error('Error setting onboarding complete:', error);
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
        console.error('Error getting last notification time:', error);
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
        console.error('Error setting last notification time:', error);
        return false;
    }
}

/**
 * Check if the global notification cooldown is active.
 * Returns true if less than 90 minutes have passed since last notification.
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

        const elapsed = Date.now() - lastTime;
        return elapsed < GLOBAL_COOLDOWN_MS;
    } catch (error) {
        console.error('Error checking cooldown:', error);
        return false;
    }
}

/**
 * Get the remaining cooldown time in milliseconds.
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

        const elapsed = Date.now() - lastTime;
        const remaining = GLOBAL_COOLDOWN_MS - elapsed;
        return remaining > 0 ? remaining : 0;
    } catch (error) {
        console.error('Error getting remaining cooldown:', error);
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
        ]);
        return true;
    } catch (error) {
        console.error('Error clearing data:', error);
        return false;
    }
}
