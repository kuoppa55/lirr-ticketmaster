/**
 * Settings state management hook for LIRR Ticket Reminder App.
 * Loads and saves user-configurable settings via AsyncStorage.
 */

import { useState, useEffect, useCallback } from 'react';
import { getUserSettings, saveUserSettings } from '../services/storage';
import { DEFAULT_SETTINGS } from '../constants';

/**
 * Hook for managing user settings.
 *
 * Returns:
 *     Object with settings, loading state, and control functions.
 */
export function useSettings() {
    const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const loaded = await getUserSettings();
            setSettings(loaded);
            setLoading(false);
        })();
    }, []);

    /**
     * Update a single setting value in state (does not persist).
     * Call saveSettings() to persist changes.
     */
    const updateSetting = useCallback((key, value) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    }, []);

    /**
     * Persist the current settings to AsyncStorage.
     *
     * Returns:
     *     True if save was successful.
     */
    const save = useCallback(async () => {
        return await saveUserSettings(settings);
    }, [settings]);

    /**
     * Reset all settings to defaults and persist.
     *
     * Returns:
     *     True if save was successful.
     */
    const resetToDefaults = useCallback(async () => {
        const defaults = { ...DEFAULT_SETTINGS };
        setSettings(defaults);
        return await saveUserSettings(defaults);
    }, []);

    return {
        settings,
        loading,
        updateSetting,
        saveSettings: save,
        resetToDefaults,
    };
}
