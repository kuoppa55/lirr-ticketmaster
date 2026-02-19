/**
 * Station selector and lookup helpers.
 */

import { Platform } from 'react-native';
import { IOS_MAX_REGIONS, MAJOR_JUNCTION_COUNT } from '../constants';
import {
    MAJOR_JUNCTIONS,
    LIRR_STATIONS,
    BRANCH_DEFINITIONS,
} from './stations.dataset';

const MAJOR_JUNCTION_SET = new Set(MAJOR_JUNCTIONS);
const STATION_BY_ID = new Map(
    LIRR_STATIONS.map((station) => [station.identifier, station])
);
const BRANCH_BY_NAME = new Map(
    BRANCH_DEFINITIONS.map((branch) => [branch.name, branch])
);
const MAJOR_STATIONS = MAJOR_JUNCTIONS
    .map((identifier) => STATION_BY_ID.get(identifier))
    .filter(Boolean);

/**
 * Get branch names in display order.
 *
 * Returns:
 *     Array of branch names ordered by BRANCH_DEFINITIONS.
 */
export function getBranches() {
    return BRANCH_DEFINITIONS.map((b) => b.name);
}

/**
 * Get stations for a branch in the order defined by BRANCH_DEFINITIONS.
 *
 * Args:
 *     branch: Branch name to get stations for.
 *
 * Returns:
 *     Array of station objects in branch display order.
 */
export function getStationsByBranch(branch) {
    const def = BRANCH_BY_NAME.get(branch);
    if (!def) return [];
    return def.stations
        .map((id) => STATION_BY_ID.get(id))
        .filter(Boolean);
}

/**
 * Get all branches a station belongs to.
 *
 * Args:
 *     stationId: Station identifier to look up.
 *
 * Returns:
 *     Array of branch names the station belongs to.
 */
export function getBranchesForStation(stationId) {
    return BRANCH_DEFINITIONS
        .filter((b) => b.stations.includes(stationId))
        .map((b) => b.name);
}

/**
 * Get stations formatted for geofencing registration.
 * On iOS, limits to 20 regions (major junctions + user selections).
 * On Android, returns all selected stations.
 *
 * Args:
 *     selectedIds: Array of user-selected station identifiers.
 *     radius: Geofence radius in meters.
 *
 * Returns:
 *     Array of station objects formatted for geofencing.
 */
export function getStationsForGeofencing(selectedIds, radius) {
    const platformStations = getStationsForPlatform(selectedIds);

    return platformStations.map((station) => ({
        identifier: station.identifier,
        latitude: station.latitude,
        longitude: station.longitude,
        radius,
        notifyOnEnter: true,
        notifyOnExit: true,
    }));
}

/**
 * Get stations based on platform limits.
 * iOS: Limited to 20 regions (major junctions always included).
 * Android: All selected stations.
 *
 * Args:
 *     selectedIds: Array of user-selected station identifiers.
 *
 * Returns:
 *     Array of station objects.
 */
export function getStationsForPlatform(selectedIds) {
    const selectedIdSet = new Set(selectedIds);

    // Get user-selected stations (excluding major junctions)
    const userSelectedStations = LIRR_STATIONS.filter((station) =>
        selectedIdSet.has(station.identifier) &&
        !MAJOR_JUNCTION_SET.has(station.identifier)
    );

    if (Platform.OS === 'ios') {
        // iOS limit: 20 regions total
        const remainingSlots = IOS_MAX_REGIONS - MAJOR_STATIONS.length;
        const limitedUserStations = userSelectedStations.slice(
            0,
            remainingSlots
        );
        return [...MAJOR_STATIONS, ...limitedUserStations];
    }

    // Android: return all selected + major junctions
    return [...MAJOR_STATIONS, ...userSelectedStations];
}

/**
 * Resolve a list of station IDs into station objects.
 *
 * Args:
 *     ids: Array of station identifiers.
 *
 * Returns:
 *     Array of station objects (missing IDs are ignored).
 */
export function getStationsByIds(ids) {
    return ids.map((id) => STATION_BY_ID.get(id)).filter(Boolean);
}

/**
 * Find a station by its identifier.
 *
 * Args:
 *     identifier: Station identifier to find.
 *
 * Returns:
 *     Station object or undefined if not found.
 */
export function findStationById(identifier) {
    return STATION_BY_ID.get(identifier);
}

/**
 * Get the number of available slots for user selection on iOS.
 *
 * Returns:
 *     Number of slots available for user-selected stations.
 */
export function getAvailableSlots() {
    if (Platform.OS !== 'ios') {
        return LIRR_STATIONS.length - MAJOR_JUNCTION_COUNT;
    }
    return IOS_MAX_REGIONS - MAJOR_JUNCTION_COUNT;
}

