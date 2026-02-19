/**
 * Hook that computes the nearest monitored stations to the user's location.
 *
 * Uses monitored station IDs + major junctions, calculates distance and
 * bearing from the user's current position, and returns the closest N.
 */

import { useState, useEffect, useMemo } from 'react';
import { MAJOR_JUNCTIONS, getStationsByIds } from '../data/stations';
import { calculateDistance } from '../utils/geo';
import { calculateBearing } from '../utils/bearing';

/**
 * Compute nearest stations relative to user location.
 *
 * Args:
 *     params:
 *         location: Object with latitude and longitude, or null.
 *         monitoredStationIds: User-selected station IDs.
 *         maxCount: Maximum number of stations to return.
 *
 * Returns:
 *     Array of { identifier, name, distance, bearing } sorted by distance.
 */
export function useNearestStations({
    location,
    monitoredStationIds = [],
    maxCount = 5,
}) {
    const [stations, setStations] = useState([]);
    const monitoredStations = useMemo(() => {
        const monitoredIds = [...MAJOR_JUNCTIONS, ...monitoredStationIds];
        const dedupedIds = [...new Set(monitoredIds)];
        return getStationsByIds(dedupedIds);
    }, [monitoredStationIds]);

    useEffect(() => {
        if (!location) {
            setStations([]);
            return;
        }

        let cancelled = false;
        // Calculate distance and bearing for each monitored station
        const withMetrics = monitoredStations.map((station) => {
            const distance = calculateDistance(
                location.latitude,
                location.longitude,
                station.latitude,
                station.longitude,
            );
            const bearing = calculateBearing(
                location.latitude,
                location.longitude,
                station.latitude,
                station.longitude,
            );

            return {
                identifier: station.identifier,
                name: station.name,
                distance,
                bearing,
            };
        });

        // Sort by distance and take closest N
        withMetrics.sort((a, b) => a.distance - b.distance);
        const nearest = withMetrics.slice(0, maxCount);

        if (!cancelled) {
            setStations(nearest);
        }

        return () => {
            cancelled = true;
        };
    }, [
        location,
        location?.latitude,
        location?.longitude,
        monitoredStations,
        maxCount,
    ]);

    return stations;
}
