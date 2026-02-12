/**
 * Hook that computes the nearest monitored stations to the user's location.
 *
 * Merges user-selected stations with major junctions, calculates distance
 * and bearing from the user's current position, and returns the closest N.
 */

import { useState, useEffect } from 'react';
import { getSelectedStations, getUserSettings } from '../services/storage';
import { LIRR_STATIONS, MAJOR_JUNCTIONS } from '../data/stations';
import { calculateDistance } from '../utils/geo';
import { calculateBearing } from '../utils/bearing';

/**
 * Compute nearest stations relative to user location.
 *
 * Args:
 *     location: Object with latitude and longitude, or null.
 *     maxCount: Maximum number of stations to return.
 *
 * Returns:
 *     Array of { identifier, name, distance, bearing } sorted by distance.
 */
export function useNearestStations(location, maxCount = 5) {
    const [stations, setStations] = useState([]);

    useEffect(() => {
        if (!location) {
            setStations([]);
            return;
        }

        let cancelled = false;

        const compute = async () => {
            const selectedIds = await getSelectedStations();

            // Combine major junctions and user-selected station IDs
            const monitoredIds = new Set([
                ...MAJOR_JUNCTIONS,
                ...selectedIds,
            ]);

            // Look up full station objects
            const monitoredStations = LIRR_STATIONS.filter((s) =>
                monitoredIds.has(s.identifier),
            );

            // Calculate distance and bearing for each
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
        };

        compute();

        return () => {
            cancelled = true;
        };
    }, [location?.latitude, location?.longitude, maxCount]);

    return stations;
}
