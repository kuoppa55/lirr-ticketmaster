/**
 * Debug state hook for LIRR Ticket Reminder App.
 * Manages real-time location tracking and debug information aggregation.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';

import { checkPermissions, getRegisteredRegions, isGeofencingActive } from '../services/geofencing';
import {
    getPendingDwellTimers,
    getRemainingCooldown,
    getLastNotificationTime,
    getUserSettings,
} from '../services/storage';
import { findNearbyGeofences } from '../utils/geo';
import { findStationById } from '../data/stations';
import { DEFAULT_SETTINGS } from '../constants';
import { logger } from '../utils/logger';

/**
 * Hook to manage debug state with real-time location tracking.
 *
 * Args:
 *     autoRefreshInterval: Interval in ms for auto-refreshing non-location data (default 2000).
 *
 * Returns:
 *     Object containing debug state and control functions.
 */
export function useDebugState(autoRefreshInterval = 2000) {
    // Location state
    const [location, setLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [locationTimestamp, setLocationTimestamp] = useState(null);

    // Permission state
    const [permissions, setPermissions] = useState({
        foreground: false,
        background: false,
        notifications: false,
    });

    // Geofencing state
    const [isGeofencing, setIsGeofencing] = useState(false);
    const [registeredRegions, setRegisteredRegions] = useState([]);
    const [nearbyGeofences, setNearbyGeofences] = useState([]);

    // Cooldown state
    const [cooldownRemaining, setCooldownRemaining] = useState(0);
    const [lastNotificationTime, setLastNotificationTimestamp] = useState(null);

    // Dwell timer state
    const [pendingDwellTimers, setPendingDwellTimers] = useState({});

    // Configuration values (loaded from user settings)
    const [config, setConfig] = useState({
        geofenceRadius: DEFAULT_SETTINGS.geofenceRadiusMeters,
        dwellTimeMs: DEFAULT_SETTINGS.dwellTimeMs,
        cooldownMs: DEFAULT_SETTINGS.cooldownMs,
    });

    // Loading state
    const [isLoading, setIsLoading] = useState(true);

    // Refs for cleanup
    const locationSubscription = useRef(null);
    const refreshInterval = useRef(null);

    /**
     * Refresh non-location debug data.
     */
    const refreshData = useCallback(async () => {
        try {
            // Check permissions
            const perms = await checkPermissions();
            setPermissions((prev) => ({
                ...prev,
                foreground: perms.foreground,
                background: perms.background,
            }));

            // Check geofencing status
            const geofencingActive = await isGeofencingActive();
            setIsGeofencing(geofencingActive);

            // Get registered regions
            const regions = await getRegisteredRegions();
            // Enrich regions with station names
            const enrichedRegions = regions.map((region) => {
                const station = findStationById(region.identifier);
                return {
                    ...region,
                    name: station?.name || region.identifier,
                };
            });
            setRegisteredRegions(enrichedRegions);

            // Get cooldown info
            const remaining = await getRemainingCooldown();
            setCooldownRemaining(remaining);

            const lastTime = await getLastNotificationTime();
            setLastNotificationTimestamp(lastTime);

            // Get pending dwell timers
            const timers = await getPendingDwellTimers();
            setPendingDwellTimers(timers);

            // Load user settings for config display
            const settings = await getUserSettings();
            setConfig({
                geofenceRadius: settings.geofenceRadiusMeters,
                dwellTimeMs: settings.dwellTimeMs,
                cooldownMs: settings.cooldownMs,
            });
        } catch (error) {
            logger.error('Error refreshing debug data:', error);
        }
    }, []);

    /**
     * Update nearby geofences based on current location.
     */
    const updateNearbyGeofences = useCallback(
        (currentLocation) => {
            if (!currentLocation || registeredRegions.length === 0) {
                setNearbyGeofences([]);
                return;
            }

            const nearby = findNearbyGeofences(
                currentLocation.latitude,
                currentLocation.longitude,
                registeredRegions
            );

            setNearbyGeofences(nearby);
        },
        [registeredRegions]
    );

    /**
     * Start location watching.
     */
    const startLocationWatch = useCallback(async () => {
        try {
            // Check foreground permission first
            const { status } = await Location.getForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLocationError('Foreground location permission not granted');
                return;
            }

            // Start watching position
            locationSubscription.current = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 2000,
                    distanceInterval: 5,
                },
                (newLocation) => {
                    const { latitude, longitude, accuracy } = newLocation.coords;
                    setLocation({ latitude, longitude, accuracy });
                    setLocationTimestamp(newLocation.timestamp);
                    setLocationError(null);
                }
            );
        } catch (error) {
            logger.error('Error starting location watch:', error);
            setLocationError(error.message);
        }
    }, []);

    /**
     * Stop location watching.
     */
    const stopLocationWatch = useCallback(() => {
        if (locationSubscription.current) {
            locationSubscription.current.remove();
            locationSubscription.current = null;
        }
    }, []);

    /**
     * Manual refresh of all data.
     */
    const refresh = useCallback(async () => {
        setIsLoading(true);
        await refreshData();
        setIsLoading(false);
    }, [refreshData]);

    // Update nearby geofences when location or regions change
    useEffect(() => {
        updateNearbyGeofences(location);
    }, [location, updateNearbyGeofences]);

    // Initialize and start watching
    useEffect(() => {
        const initialize = async () => {
            setIsLoading(true);
            await refreshData();
            await startLocationWatch();
            setIsLoading(false);
        };

        initialize();

        // Set up auto-refresh interval for non-location data
        refreshInterval.current = setInterval(refreshData, autoRefreshInterval);

        // Cleanup
        return () => {
            stopLocationWatch();
            if (refreshInterval.current) {
                clearInterval(refreshInterval.current);
                refreshInterval.current = null;
            }
        };
    }, [refreshData, startLocationWatch, stopLocationWatch, autoRefreshInterval]);

    return {
        // Location
        location,
        locationError,
        locationTimestamp,

        // Permissions
        permissions,

        // Geofencing
        isGeofencing,
        registeredRegions,
        nearbyGeofences,

        // Cooldown
        cooldownRemaining,
        lastNotificationTime,

        // Dwell timers
        pendingDwellTimers,

        // Configuration
        config,

        // State
        isLoading,

        // Actions
        refresh,
        stopLocationWatch,
        startLocationWatch,
    };
}
