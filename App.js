/**
 * LIRR Ticket Reminder App
 *
 * Cross-platform Expo/React Native app that uses geofencing to detect when
 * users approach LIRR stations and sends high-priority notifications to
 * remind them to activate their tickets.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

import { GEOFENCING_TASK_NAME, DWELL_TIME_MS } from './src/constants';
import { findStationById } from './src/data/stations';
import { sendTicketReminder } from './src/services/notifications';
import {
    isInCooldown,
    setLastNotificationTime,
    hasCompletedOnboarding,
    setOnboardingComplete,
    getSelectedStations,
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

import HomeScreen from './src/screens/HomeScreen';
import StationSelectScreen from './src/screens/StationSelectScreen';

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
        return;
    }

    if (eventType === Location.GeofencingEventType.Enter) {
        console.log(`Entered geofence: ${stationId}`);

        // Start 60-second dwell timer
        pendingDwellTimers[stationId] = setTimeout(async () => {
            try {
                // Check global cooldown before sending
                const inCooldown = await isInCooldown();
                if (inCooldown) {
                    console.log('In cooldown period, skipping notification');
                    delete pendingDwellTimers[stationId];
                    return;
                }

                // Find station name
                const station = findStationById(stationId);
                const stationName = station?.name || 'LIRR Station';

                // Send notification
                await sendTicketReminder(stationName);
                console.log(`Notification sent for: ${stationName}`);

                // Start 90-minute cooldown
                await setLastNotificationTime(Date.now());
            } catch (err) {
                console.error('Error sending notification:', err);
            } finally {
                delete pendingDwellTimers[stationId];
            }
        }, DWELL_TIME_MS);
    } else if (eventType === Location.GeofencingEventType.Exit) {
        console.log(`Exited geofence: ${stationId}`);

        // User left before 60 seconds - cancel the pending notification
        if (pendingDwellTimers[stationId]) {
            clearTimeout(pendingDwellTimers[stationId]);
            delete pendingDwellTimers[stationId];
            console.log(`Cancelled pending notification for: ${stationId}`);
        }
    }
});

/**
 * Main App component.
 */
export default function App() {
    const [screen, setScreen] = useState('loading');
    const [isOnboarding, setIsOnboarding] = useState(false);

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
     * Handle completion of station selection (onboarding or edit).
     */
    const handleStationSelectionComplete = async () => {
        if (isOnboarding) {
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
        }

        setScreen('home');
    };

    /**
     * Navigate to station selection screen for editing.
     */
    const handleEditStations = () => {
        setIsOnboarding(false);
        setScreen('stations');
    };

    // Render loading state
    if (screen === 'loading') {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
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

    // Render home screen
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <HomeScreen onEditStations={handleEditStations} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0066CC',
    },
});
