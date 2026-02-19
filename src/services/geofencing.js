/**
 * Geofencing service for LIRR Ticket Reminder App.
 * Handles location permissions and geofence region management.
 */

import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { GEOFENCING_TASK_NAME } from '../constants';
import { getStationsForGeofencing } from '../data/stations';
import { getUserSettings } from './storage';
import { logger } from '../utils/logger';

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
 *
 * Returns:
 *     Object: { granted, needsAndroid11Rationale }.
 */
export async function requestBackgroundPermissions() {
    // Check if foreground permissions are already granted
    const { status: foregroundStatus } =
        await Location.getForegroundPermissionsAsync();

    if (foregroundStatus !== 'granted') {
        const granted = await requestForegroundPermissions();
        if (!granted) {
            return { granted: false, needsAndroid11Rationale: false };
        }
    }

    const needsAndroid11Rationale =
        Platform.OS === 'android' && Platform.Version >= 30;

    const { status } = await Location.requestBackgroundPermissionsAsync();
    return {
        granted: status === 'granted',
        needsAndroid11Rationale,
    };
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
            logger.warn('Background location permission not granted');
            return false;
        }

        // Stop existing geofencing first
        await stopGeofencing();

        // Read radius from user settings
        const settings = await getUserSettings();

        // Get stations formatted for geofencing
        const regions = getStationsForGeofencing(
            selectedStationIds,
            settings.geofenceRadiusMeters
        );

        if (regions.length === 0) {
            logger.warn('No stations to monitor');
            return false;
        }

        // Start geofencing
        await Location.startGeofencingAsync(GEOFENCING_TASK_NAME, regions);

        logger.info(`Started geofencing for ${regions.length} stations`);
        return true;
    } catch (error) {
        logger.error('Error starting geofencing:', error);
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
            logger.info('Stopped geofencing');
        }

        return true;
    } catch (error) {
        logger.error('Error stopping geofencing:', error);
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
        logger.error('Error checking geofencing status:', error);
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
        logger.error('Error getting registered regions:', error);
        return [];
    }
}
