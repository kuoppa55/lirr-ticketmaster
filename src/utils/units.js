/**
 * Unit conversion utilities for LIRR Ticket Reminder App.
 * Handles metric/imperial conversions and display formatting.
 */

import { SETTINGS_LIMITS } from '../constants';

const METERS_PER_FOOT = 0.3048;
const FEET_PER_MILE = 5280;

/**
 * Convert meters to feet.
 *
 * Args:
 *     m: Distance in meters.
 *
 * Returns:
 *     Distance in feet.
 */
export function metersToFeet(m) {
    return m / METERS_PER_FOOT;
}

/**
 * Convert feet to meters.
 *
 * Args:
 *     ft: Distance in feet.
 *
 * Returns:
 *     Distance in meters.
 */
export function feetToMeters(ft) {
    return ft * METERS_PER_FOOT;
}

/**
 * Convert meters to miles.
 *
 * Args:
 *     m: Distance in meters.
 *
 * Returns:
 *     Distance in miles.
 */
export function metersToMiles(m) {
    return metersToFeet(m) / FEET_PER_MILE;
}

/**
 * Format a distance for display in the user's preferred unit system.
 *
 * Args:
 *     meters: Distance in meters.
 *     useMetric: If true, display in meters/km. If false, display in feet/miles.
 *
 * Returns:
 *     Formatted distance string (e.g., "~1000 ft", "300 m", "1.2 mi").
 */
export function formatDistance(meters, useMetric = false) {
    if (useMetric) {
        if (meters < 1000) {
            return `${Math.round(meters)} m`;
        }
        return `${(meters / 1000).toFixed(1)} km`;
    }

    const feet = metersToFeet(meters);
    if (feet < FEET_PER_MILE) {
        return `${Math.round(feet)} ft`;
    }
    return `${(feet / FEET_PER_MILE).toFixed(1)} mi`;
}

/**
 * Format a duration in milliseconds for display.
 *
 * Args:
 *     ms: Duration in milliseconds.
 *
 * Returns:
 *     Formatted duration string (e.g., "30 seconds", "1 minute", "90 minutes").
 */
export function formatDuration(ms) {
    const seconds = Math.round(ms / 1000);
    if (seconds < 60) {
        return seconds === 1 ? '1 second' : `${seconds} seconds`;
    }

    const minutes = Math.round(ms / 60000);
    if (minutes < 60) {
        return minutes === 1 ? '1 minute' : `${minutes} minutes`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
        return hours === 1 ? '1 hour' : `${hours} hours`;
    }
    return `${hours}h ${remainingMinutes}m`;
}

/**
 * Parse a radius text input back to meters.
 *
 * Args:
 *     text: User input string (numeric).
 *     useMetric: If true, input is in meters. If false, input is in feet.
 *
 * Returns:
 *     Distance in meters, or NaN if input is invalid.
 */
export function parseRadiusInput(text, useMetric = false) {
    const value = parseFloat(text);
    if (isNaN(value) || value <= 0) {
        return NaN;
    }
    const meters = useMetric ? value : feetToMeters(value);
    if (
        meters < SETTINGS_LIMITS.geofenceRadiusMeters.min ||
        meters > SETTINGS_LIMITS.geofenceRadiusMeters.max
    ) {
        return NaN;
    }
    return meters;
}

/**
 * Parse a duration text input back to milliseconds.
 *
 * Args:
 *     text: User input string (numeric).
 *     unit: Time unit - 'seconds' or 'minutes'.
 *
 * Returns:
 *     Duration in milliseconds, or NaN if input is invalid.
 */
export function parseDurationInput(
    text,
    unit = 'minutes',
    { minMs = 1, maxMs = Number.MAX_SAFE_INTEGER } = {}
) {
    const value = parseFloat(text);
    if (isNaN(value) || value <= 0) {
        return NaN;
    }
    const duration = unit === 'seconds' ? value * 1000 : value * 60000;
    if (duration < minMs || duration > maxMs) {
        return NaN;
    }
    return duration;
}
