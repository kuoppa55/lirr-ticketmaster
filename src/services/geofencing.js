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
import { captureEvent } from './telemetry';
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
    void captureEvent('permissions_foreground_result', { status });
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
    void captureEvent('permissions_background_result', { status });
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
            logger.warn('Background location permission not granted', { status });
            void captureEvent('geofencing_start_denied_permissions', { status });
            return false;
        }

        // Stop existing geofencing first
        const stopped = await stopGeofencing();
        if (!stopped) {
            logger.warn('Failed to stop existing geofencing before restart');
            void captureEvent('geofencing_restart_stop_failed');
            return false;
        }

        // Read radius from user settings
        const settings = await getUserSettings();

        // Get stations formatted for geofencing
        const regions = getStationsForGeofencing(
            selectedStationIds,
            settings.geofenceRadiusMeters
        );

        if (regions.length === 0) {
            logger.warn('No stations to monitor');
            void captureEvent('geofencing_start_no_regions');
            return false;
        }

        // Start geofencing
        await Location.startGeofencingAsync(GEOFENCING_TASK_NAME, regions);

        logger.info(`Started geofencing for ${regions.length} stations`);
        void captureEvent('geofencing_start_success', {
            regionCount: regions.length,
        });
        return true;
    } catch (error) {
        logger.error('Error starting geofencing:', error);
        void captureEvent('geofencing_start_error');
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
            void captureEvent('geofencing_stop_success');
        } else {
            logger.info('Geofencing stop skipped because task was not registered');
            void captureEvent('geofencing_stop_noop');
        }

        return true;
    } catch (error) {
        logger.error('Error stopping geofencing:', error);
        void captureEvent('geofencing_stop_error');
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
        void captureEvent('geofencing_check_active_error');
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
        void captureEvent('geofencing_get_regions_error');
        return [];
    }
}

/**
 * Reconcile runtime geofencing state on app launch/resume.
 * Ensures revoked permissions cannot leave stale "active" state and
 * attempts to restore monitoring when expected regions are missing.
 *
 * Returns:
 *     Object with { active, reconciled, reason }.
 */
export async function reconcileGeofencingState(selectedStationIds) {
    try {
        const permissions = await checkPermissions();
        if (!permissions.background) {
            await stopGeofencing();
            return {
                active: false,
                reconciled: true,
                reason: 'background_permission_missing',
            };
        }

        const active = await isGeofencingActive();
        const regions = await getRegisteredRegions();

        if (active && regions.length > 0) {
            return { active: true, reconciled: true, reason: 'healthy' };
        }

        const started = await startGeofencing(selectedStationIds);
        return {
            active: started,
            reconciled: true,
            reason: started ? 'restarted' : 'restart_failed',
        };
    } catch (error) {
        logger.error('Error reconciling geofencing state:', error);
        return { active: false, reconciled: false, reason: 'error' };
    }
}
