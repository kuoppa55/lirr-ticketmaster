/**
 * Geofencing service for LIRR Ticket Reminder App.
 * Handles location permissions and geofence region management.
 */

import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Alert, Platform } from 'react-native';
import { GEOFENCING_TASK_NAME, GEOFENCE_RADIUS } from '../constants';
import { getStationsForGeofencing } from '../data/stations';

/**
 * Request foreground location permissions.
 * This must be called before requesting background permissions.
 *
 * Returns:
 *     True if permissions granted, false otherwise.
 */
export async function requestForegroundPermissions() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
}

/**
 * Request background location permissions.
 * On Android 11+, shows an explanation alert before requesting.
 *
 * Returns:
 *     True if permissions granted, false otherwise.
 */
export async function requestBackgroundPermissions() {
    // Check if foreground permissions are already granted
    const { status: foregroundStatus } =
        await Location.getForegroundPermissionsAsync();

    if (foregroundStatus !== 'granted') {
        const granted = await requestForegroundPermissions();
        if (!granted) {
            return false;
        }
    }

    // On Android 11+, show explanation before requesting
    if (Platform.OS === 'android' && Platform.Version >= 30) {
        await new Promise((resolve) => {
            Alert.alert(
                'Background Location Required',
                'To remind you to activate your ticket even when the app is closed, ' +
                    'please select "Allow all the time" on the next screen.',
                [{ text: 'Continue', onPress: resolve }]
            );
        });
    }

    const { status } = await Location.requestBackgroundPermissionsAsync();
    return status === 'granted';
}

/**
 * Check if all required location permissions are granted.
 *
 * Returns:
 *     Object with foreground and background permission status.
 */
export async function checkPermissions() {
    const { status: foreground } =
        await Location.getForegroundPermissionsAsync();
    const { status: background } =
        await Location.getBackgroundPermissionsAsync();

    return {
        foreground: foreground === 'granted',
        background: background === 'granted',
    };
}

/**
 * Start geofencing for the selected stations.
 *
 * Args:
 *     selectedStationIds: Array of station identifiers to monitor.
 *
 * Returns:
 *     True if geofencing started successfully, false otherwise.
 */
export async function startGeofencing(selectedStationIds) {
    try {
        // Verify background permissions
        const { status } = await Location.getBackgroundPermissionsAsync();
        if (status !== 'granted') {
            console.warn('Background location permission not granted');
            return false;
        }

        // Stop existing geofencing first
        await stopGeofencing();

        // Get stations formatted for geofencing
        const regions = getStationsForGeofencing(
            selectedStationIds,
            GEOFENCE_RADIUS
        );

        if (regions.length === 0) {
            console.warn('No stations to monitor');
            return false;
        }

        // Start geofencing
        await Location.startGeofencingAsync(GEOFENCING_TASK_NAME, regions);

        console.log(`Started geofencing for ${regions.length} stations`);
        return true;
    } catch (error) {
        console.error('Error starting geofencing:', error);
        return false;
    }
}

/**
 * Stop all geofencing.
 *
 * Returns:
 *     True if geofencing stopped successfully, false otherwise.
 */
export async function stopGeofencing() {
    try {
        const isRegistered = await TaskManager.isTaskRegisteredAsync(
            GEOFENCING_TASK_NAME
        );

        if (isRegistered) {
            await Location.stopGeofencingAsync(GEOFENCING_TASK_NAME);
            console.log('Stopped geofencing');
        }

        return true;
    } catch (error) {
        console.error('Error stopping geofencing:', error);
        return false;
    }
}

/**
 * Check if geofencing is currently active.
 *
 * Returns:
 *     True if geofencing is active, false otherwise.
 */
export async function isGeofencingActive() {
    try {
        return await TaskManager.isTaskRegisteredAsync(GEOFENCING_TASK_NAME);
    } catch (error) {
        console.error('Error checking geofencing status:', error);
        return false;
    }
}

/**
 * Get the currently registered geofence regions.
 *
 * Returns:
 *     Array of registered region objects, or empty array on error.
 */
export async function getRegisteredRegions() {
    try {
        const isActive = await isGeofencingActive();
        if (!isActive) {
            return [];
        }

        const taskOptions = await TaskManager.getTaskOptionsAsync(
            GEOFENCING_TASK_NAME
        );
        return taskOptions?.regions || [];
    } catch (error) {
        console.error('Error getting registered regions:', error);
        return [];
    }
}
