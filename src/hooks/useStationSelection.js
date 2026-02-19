/**
 * Hook for managing station selection state.
 */

import { useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import {
    MAJOR_JUNCTIONS,
    getAvailableSlots,
    getStationsByBranch,
} from '../data/stations';
import {
    getSelectedStations,
    saveSelectedStations,
} from '../services/storage';
import { logger } from '../utils/logger';

/**
 * Custom hook for managing station selection.
 *
 * Returns:
 *     Object containing selection state and management functions.
 */
export function useStationSelection() {
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadSelections = useCallback(async () => {
        setLoading(true);
        try {
            const saved = await getSelectedStations();
            setSelectedIds(saved);
        } catch (error) {
            logger.error('Error loading selections:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load saved selections on mount
    useEffect(() => {
        loadSelections();
    }, [loadSelections]);

    /**
     * Toggle selection of a station.
     *
     * Args:
     *     stationId: Station identifier to toggle.
     *
     * Returns:
     *     True if station is now selected, false if deselected or blocked.
     */
    const toggleStation = useCallback(
        (stationId) => {
            // Major junctions cannot be deselected
            if (MAJOR_JUNCTIONS.includes(stationId)) {
                return true;
            }

            const isCurrentlySelected = selectedIds.includes(stationId);

            if (isCurrentlySelected) {
                // Deselect
                setSelectedIds((prev) =>
                    prev.filter((id) => id !== stationId)
                );
                return false;
            } else {
                // Check if we're at the limit (iOS only)
                if (Platform.OS === 'ios') {
                    const currentUserSelections = selectedIds.filter(
                        (id) => !MAJOR_JUNCTIONS.includes(id)
                    );
                    const availableSlots = getAvailableSlots();

                    if (currentUserSelections.length >= availableSlots) {
                        return false; // At limit, cannot select more
                    }
                }

                // Select
                setSelectedIds((prev) => [...prev, stationId]);
                return true;
            }
        },
        [selectedIds]
    );

    /**
     * Check if a station is selected.
     *
     * Args:
     *     stationId: Station identifier to check.
     *
     * Returns:
     *     True if selected (including major junctions), false otherwise.
     */
    const isSelected = useCallback(
        (stationId) => {
            if (MAJOR_JUNCTIONS.includes(stationId)) {
                return true;
            }
            return selectedIds.includes(stationId);
        },
        [selectedIds]
    );

    /**
     * Check if a station is a major junction (always monitored).
     *
     * Args:
     *     stationId: Station identifier to check.
     *
     * Returns:
     *     True if station is a major junction.
     */
    const isMajorJunction = useCallback((stationId) => {
        return MAJOR_JUNCTIONS.includes(stationId);
    }, []);

    /**
     * Get the count of user-selected stations (excluding major junctions).
     *
     * Returns:
     *     Number of user-selected stations.
     */
    const getUserSelectionCount = useCallback(() => {
        return selectedIds.filter((id) => !MAJOR_JUNCTIONS.includes(id)).length;
    }, [selectedIds]);

    /**
     * Get the total count of monitored stations.
     *
     * Returns:
     *     Number of total monitored stations (major junctions + user selections).
     */
    const getTotalMonitoredCount = useCallback(() => {
        return MAJOR_JUNCTIONS.length + getUserSelectionCount();
    }, [getUserSelectionCount]);

    /**
     * Get remaining available slots for user selection (iOS only).
     *
     * Returns:
     *     Number of remaining slots, or -1 if unlimited (Android).
     */
    const getRemainingSlots = useCallback(() => {
        if (Platform.OS !== 'ios') {
            return -1; // Unlimited on Android
        }
        const availableSlots = getAvailableSlots();
        return availableSlots - getUserSelectionCount();
    }, [getUserSelectionCount]);

    /**
     * Save current selections.
     *
     * Returns:
     *     True if save successful.
     */
    const saveSelections = useCallback(async () => {
        try {
            await saveSelectedStations(selectedIds);
            return true;
        } catch (error) {
            logger.error('Error saving selections:', error);
            return false;
        }
    }, [selectedIds]);

    /**
     * Select all stations on a specific branch.
     *
     * Args:
     *     branch: Branch name to select.
     */
    const selectBranch = useCallback(
        (branch) => {
            const branchStations = getStationsByBranch(branch).map(
                (s) => s.identifier
            );

            const newSelections = branchStations.filter(
                (id) =>
                    !MAJOR_JUNCTIONS.includes(id) && !selectedIds.includes(id)
            );

            // On iOS, respect the limit
            if (Platform.OS === 'ios') {
                const availableSlots = getAvailableSlots();
                const currentCount = getUserSelectionCount();
                const canAdd = availableSlots - currentCount;
                const toAdd = newSelections.slice(0, canAdd);
                setSelectedIds((prev) => [...prev, ...toAdd]);
            } else {
                setSelectedIds((prev) => [...prev, ...newSelections]);
            }
        },
        [selectedIds, getUserSelectionCount]
    );

    /**
     * Deselect all stations on a specific branch.
     *
     * Args:
     *     branch: Branch name to deselect.
     */
    const deselectBranch = useCallback((branch) => {
        const branchStationIds = getStationsByBranch(branch).map(
            (s) => s.identifier
        );

        setSelectedIds((prev) =>
            prev.filter(
                (id) =>
                    !branchStationIds.includes(id) ||
                    MAJOR_JUNCTIONS.includes(id)
            )
        );
    }, []);

    /**
     * Clear all user selections (keeps major junctions).
     */
    const clearUserSelections = useCallback(() => {
        setSelectedIds([]);
    }, []);

    return {
        selectedIds,
        loading,
        toggleStation,
        isSelected,
        isMajorJunction,
        getUserSelectionCount,
        getTotalMonitoredCount,
        getRemainingSlots,
        saveAndApply: saveSelections,
        saveSelections,
        selectBranch,
        deselectBranch,
        clearUserSelections,
        loadSelections,
    };
}
