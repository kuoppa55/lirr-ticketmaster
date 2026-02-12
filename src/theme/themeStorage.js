/**
 * Theme persistence using AsyncStorage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import { THEME_IDS } from './definitions';

/**
 * Get the currently selected theme ID.
 *
 * Returns:
 *     The saved theme ID string, or null if none selected.
 */
export async function getSelectedTheme() {
    try {
        const themeId = await AsyncStorage.getItem(
            STORAGE_KEYS.SELECTED_THEME
        );
        return themeId || null;
    } catch (error) {
        console.error('Error loading selected theme:', error);
        return null;
    }
}

/**
 * Save the selected theme ID.
 *
 * Args:
 *     themeId: One of the THEME_IDS values.
 *
 * Returns:
 *     True if save successful, false otherwise.
 */
export async function saveSelectedTheme(themeId) {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_THEME, themeId);
        return true;
    } catch (error) {
        console.error('Error saving selected theme:', error);
        return false;
    }
}
