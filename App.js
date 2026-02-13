/**
 * LIRR Ticket Reminder App
 *
 * Cross-platform Expo/React Native app that uses geofencing to detect when
 * users approach LIRR stations and sends high-priority notifications to
 * remind them to activate their tickets.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';

import { GEOFENCING_TASK_NAME } from './src/constants';
import { findStationById } from './src/data/stations';
import { sendTicketReminder } from './src/services/notifications';
import {
    isInCooldown,
    setLastNotificationTime,
    hasCompletedOnboarding,
    setOnboardingComplete,
    getSelectedStations,
    addPendingDwellTimer,
    removePendingDwellTimer,
    getUserSettings,
    saveUserSettings,
} from './src/services/storage';
import {
    configureNotificationHandler,
    setupNotificationChannel,
    requestNotificationPermissions,
} from './src/services/notifications';
import {
    requestForegroundPermissions,
    requestBackgroundPermissions,
    startGeofencing,
} from './src/services/geofencing';
import { useSettings } from './src/hooks/useSettings';

import HomeScreen from './src/screens/HomeScreen';
import StationSelectScreen from './src/screens/StationSelectScreen';
import DebugScreen from './src/screens/DebugScreen';
import SettingsConfigScreen from './src/screens/SettingsConfigScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// In-memory tracking for dwell timers (persists while app process runs)
const pendingDwellTimers = {};

/**
 * CRITICAL: Task definition MUST be at module level (outside any component).
 * This ensures the task is registered when the module loads, which is required
 * for background execution.
 */
TaskManager.defineTask(GEOFENCING_TASK_NAME, async ({ data, error }) => {
    if (error) {
        console.error('Geofencing task error:', error);
        return;
    }

    if (!data) {
        return;
    }

    const { eventType, region } = data;
    const stationId = region?.identifier;

    if (!stationId) {
        console.warn(
            'Geofencing task received event with missing region.identifier:',
            JSON.stringify({ eventType, region })
        );
        return;
    }

    if (eventType === Location.GeofencingEventType.Enter) {
        console.log(`Entered geofence: ${stationId}`);

        // Find station name for persistence
        const station = findStationById(stationId);
        const stationName = station?.name || 'LIRR Station';

        // Persist dwell timer start (survives app restart)
        await addPendingDwellTimer(stationId, stationName);

        // Read dwell time from user settings
        const settings = await getUserSettings();

        // Start dwell timer using user-configured duration
        pendingDwellTimers[stationId] = setTimeout(async () => {
            try {
                // Check global cooldown before sending
                const inCooldown = await isInCooldown();
                if (inCooldown) {
                    console.log('In cooldown period, skipping notification');
                    delete pendingDwellTimers[stationId];
                    await removePendingDwellTimer(stationId);
                    return;
                }

                // Send notification
                await sendTicketReminder(stationName);
                console.log(`Notification sent for: ${stationName}`);

                // Start cooldown
                await setLastNotificationTime(Date.now());
            } catch (err) {
                console.error('Error sending notification:', err);
            } finally {
                delete pendingDwellTimers[stationId];
                await removePendingDwellTimer(stationId);
            }
        }, settings.dwellTimeMs);
    } else if (eventType === Location.GeofencingEventType.Exit) {
        console.log(`Exited geofence: ${stationId}`);

        // User left before dwell time expired - cancel the pending notification
        if (pendingDwellTimers[stationId]) {
            clearTimeout(pendingDwellTimers[stationId]);
            delete pendingDwellTimers[stationId];
            console.log(`Cancelled pending notification for: ${stationId}`);
        }
        // Always remove persisted timer on exit
        await removePendingDwellTimer(stationId);
    }
});

/**
 * Main App component.
 */
export default function App() {
    const [screen, setScreen] = useState('loading');
    const [isOnboarding, setIsOnboarding] = useState(false);
    const {
        settings,
        loading: settingsLoading,
        updateSetting,
        saveSettings,
    } = useSettings();

    const [fontsLoaded, fontError] = useFonts({
        PressStart2P_400Regular,
    });

    // Track previous radius to detect changes that need geofence restart
    const [savedRadiusMeters, setSavedRadiusMeters] = useState(null);

    /**
     * Initialize the app: check onboarding status, request permissions,
     * and start geofencing if appropriate.
     */
    const initializeApp = useCallback(async () => {
        try {
            // Configure notification handler for foreground
            configureNotificationHandler();

            // Setup Android notification channel
            await setupNotificationChannel();

            // Check if onboarding is complete
            const onboardingDone = await hasCompletedOnboarding();

            if (!onboardingDone) {
                // First time user - show station selection
                setIsOnboarding(true);
                setScreen('stations');
                return;
            }

            // Load saved radius for change detection
            const currentSettings = await getUserSettings();
            setSavedRadiusMeters(currentSettings.geofenceRadiusMeters);

            // Request permissions
            const notificationGranted = await requestNotificationPermissions();
            if (!notificationGranted) {
                console.warn('Notification permission denied');
            }

            const foregroundGranted = await requestForegroundPermissions();
            if (!foregroundGranted) {
                console.warn('Foreground location permission denied');
                setScreen('home');
                return;
            }

            const backgroundGranted = await requestBackgroundPermissions();
            if (!backgroundGranted) {
                console.warn('Background location permission denied');
            }

            // Start geofencing with saved stations
            if (backgroundGranted) {
                const selectedStations = await getSelectedStations();
                await startGeofencing(selectedStations);
            }

            setScreen('home');
        } catch (error) {
            console.error('Error initializing app:', error);
            setScreen('home');
        }
    }, []);

    useEffect(() => {
        initializeApp();
    }, [initializeApp]);

    /**
     * Handle completion of station selection during onboarding.
     * Proceed to settings configuration screen.
     */
    const handleStationSelectionComplete = async () => {
        if (isOnboarding) {
            // During onboarding, proceed to settings config screen
            setScreen('onboarding-settings');
            return;
        }

        // When editing stations (not onboarding), restart geofencing and go home
        const selectedStations = await getSelectedStations();
        await startGeofencing(selectedStations);
        setScreen('home');
    };

    /**
     * Handle completion of onboarding settings configuration.
     * Saves settings, requests permissions, and starts geofencing.
     */
    const handleOnboardingSettingsSave = async () => {
        // Save the settings
        await saveSettings();
        setSavedRadiusMeters(settings.geofenceRadiusMeters);

        // Complete onboarding
        await setOnboardingComplete();
        setIsOnboarding(false);

        // Request permissions
        const notificationGranted = await requestNotificationPermissions();
        if (!notificationGranted) {
            console.warn('Notification permission denied');
        }

        const foregroundGranted = await requestForegroundPermissions();
        if (foregroundGranted) {
            const backgroundGranted = await requestBackgroundPermissions();
            if (backgroundGranted) {
                const selectedStations = await getSelectedStations();
                await startGeofencing(selectedStations);
            }
        }

        setScreen('home');
    };

    /**
     * Navigate to settings screen from home.
     */
    const handleOpenSettings = () => {
        setScreen('settings');
    };

    /**
     * Navigate back to home from settings.
     */
    const handleCloseSettings = () => {
        setScreen('home');
    };

    /**
     * Handle saving settings from the settings screen.
     * Restarts geofencing if radius changed.
     */
    const handleSettingsSave = async () => {
        await saveSettings();

        // If radius changed, restart geofencing with new radius
        if (
            savedRadiusMeters !== null &&
            settings.geofenceRadiusMeters !== savedRadiusMeters
        ) {
            const selectedStations = await getSelectedStations();
            await startGeofencing(selectedStations);
            console.log(
                `Restarted geofencing with new radius: ${settings.geofenceRadiusMeters}m`
            );
        }
        setSavedRadiusMeters(settings.geofenceRadiusMeters);
    };

    /**
     * Navigate to station selection screen for editing.
     */
    const handleEditStations = () => {
        setIsOnboarding(false);
        setScreen('stations');
    };

    /**
     * Navigate to debug screen.
     */
    const handleOpenDebug = () => {
        setScreen('debug');
    };

    /**
     * Navigate back from debug screen to settings.
     */
    const handleCloseDebug = () => {
        setScreen('settings');
    };

    // Font loading is ready if loaded successfully OR if it errored (graceful fallback)
    const fontsReady = fontsLoaded || !!fontError;

    // Render loading state (including font loading)
    if (screen === 'loading' || settingsLoading || !fontsReady) {
        return (
            <View style={styles.loadingScreen}>
                <StatusBar barStyle="light-content" />
                <ActivityIndicator size="large" color="#FF8C00" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    // Render station selection screen
    if (screen === 'stations') {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <StationSelectScreen
                    onComplete={handleStationSelectionComplete}
                    isOnboarding={isOnboarding}
                />
            </View>
        );
    }

    // Render onboarding settings screen
    if (screen === 'onboarding-settings') {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <SettingsConfigScreen
                    settings={settings}
                    onUpdateSetting={updateSetting}
                    onSave={handleOnboardingSettingsSave}
                    isOnboarding={true}
                />
            </View>
        );
    }

    // Render settings screen
    if (screen === 'settings') {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <SettingsScreen
                    settings={settings}
                    onUpdateSetting={updateSetting}
                    onSave={handleSettingsSave}
                    onBack={handleCloseSettings}
                    onEditStations={handleEditStations}
                    onOpenDebug={handleOpenDebug}
                />
            </View>
        );
    }

    // Render debug screen
    if (screen === 'debug') {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <DebugScreen onBack={handleCloseDebug} />
            </View>
        );
    }

    // Render home screen
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <HomeScreen onOpenSettings={handleOpenSettings} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    loadingScreen: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#FF8C00',
        marginTop: 12,
        fontSize: 14,
    },
});
