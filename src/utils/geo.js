/**
 * Geospatial utility functions for LIRR Ticket Reminder App.
 * Provides distance calculations and geofence proximity checks.
 */

/**
 * Earth's radius in meters for Haversine formula.
 */
const EARTH_RADIUS_METERS = 6371000;

/**
 * Convert degrees to radians.
 *
 * Args:
 *     degrees: Angle in degrees.
 *
 * Returns:
 *     Angle in radians.
 */
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Calculate distance between two coordinates using Haversine formula.
 *
 * Args:
 *     lat1: Latitude of first point in degrees.
 *     lon1: Longitude of first point in degrees.
 *     lat2: Latitude of second point in degrees.
 *     lon2: Longitude of second point in degrees.
 *
 * Returns:
 *     Distance in meters between the two points.
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_RADIUS_METERS * c;
}

/**
 * Check if a point is inside a geofence.
 *
 * Args:
 *     lat: Latitude of the point to check.
 *     lon: Longitude of the point to check.
 *     geofenceLat: Latitude of the geofence center.
 *     geofenceLon: Longitude of the geofence center.
 *     radius: Geofence radius in meters.
 *
 * Returns:
 *     True if point is inside geofence, false otherwise.
 */
export function isInsideGeofence(lat, lon, geofenceLat, geofenceLon, radius) {
    const distance = calculateDistance(lat, lon, geofenceLat, geofenceLon);
    return distance <= radius;
}

/**
 * Find nearby geofences from a list of regions.
 *
 * Args:
 *     lat: Current latitude.
 *     lon: Current longitude.
 *     regions: Array of region objects with latitude, longitude, identifier, and radius.
 *
 * Returns:
 *     Array of objects with region info, distance, and isInside flag, sorted by distance.
 */
export function findNearbyGeofences(lat, lon, regions) {
    if (!regions || !Array.isArray(regions)) {
        return [];
    }

    return regions
        .map((region) => {
            const distance = calculateDistance(
                lat,
                lon,
                region.latitude,
                region.longitude
            );
            const isInside = distance <= (region.radius || 300);

            return {
                identifier: region.identifier,
                name: region.name || region.identifier,
                latitude: region.latitude,
                longitude: region.longitude,
                radius: region.radius || 300,
                distance: Math.round(distance),
                isInside,
            };
        })
        .sort((a, b) => a.distance - b.distance);
}

/**
 * Format distance for display.
 *
 * Args:
 *     meters: Distance in meters.
 *
 * Returns:
 *     Formatted string (e.g., "125m" or "1.2 km").
 */
export function formatDistance(meters) {
    if (meters < 1000) {
        return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
}
