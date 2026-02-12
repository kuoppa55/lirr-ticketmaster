/**
 * Bearing calculation utilities for compass/radar feature.
 */

/**
 * Calculate the forward azimuth (initial bearing) from one coordinate to another.
 *
 * Args:
 *     lat1: Latitude of origin in degrees.
 *     lon1: Longitude of origin in degrees.
 *     lat2: Latitude of destination in degrees.
 *     lon2: Longitude of destination in degrees.
 *
 * Returns:
 *     Bearing in degrees (0-360), where 0 = North, 90 = East.
 */
export function calculateBearing(lat1, lon1, lat2, lon2) {
    const toRad = (deg) => deg * (Math.PI / 180);
    const toDeg = (rad) => rad * (180 / Math.PI);

    const phi1 = toRad(lat1);
    const phi2 = toRad(lat2);
    const deltaLambda = toRad(lon2 - lon1);

    const y = Math.sin(deltaLambda) * Math.cos(phi2);
    const x =
        Math.cos(phi1) * Math.sin(phi2) -
        Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

    const theta = Math.atan2(y, x);
    return (toDeg(theta) + 360) % 360;
}

/**
 * Get bearing relative to the device's current heading.
 *
 * Args:
 *     absoluteBearing: Bearing to target in degrees (0-360).
 *     deviceHeading: Device heading in degrees (0-360, 0 = North).
 *
 * Returns:
 *     Relative bearing in degrees (0-360).
 */
export function getRelativeBearing(absoluteBearing, deviceHeading) {
    return (absoluteBearing - deviceHeading + 360) % 360;
}
