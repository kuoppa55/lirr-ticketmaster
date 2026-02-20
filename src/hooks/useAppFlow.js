import { useState, useEffect, useCallback, useReducer } from 'react';
import { Alert, Platform } from 'react-native';

import { SCREENS } from '../constants/screens';
import {
    hasCompletedOnboarding,
    setOnboardingComplete,
    getSelectedStations,
    getUserSettings,
    reconcileRuntimeState,
} from '../services/storage';
import {
    configureNotificationHandler,
    setupNotificationChannel,
    requestNotificationPermissions,
} from '../services/notifications';
import {
    requestForegroundPermissions,
    requestBackgroundPermissions,
    startGeofencing,
    reconcileGeofencingState,
    waitForBackgroundPermissionSync,
} from '../services/geofencing';
import { IS_NON_PROD } from '../config/env';
import { captureEvent } from '../services/telemetry';
import { logger } from '../utils/logger';

function screenReducer(_state, action) {
    if (action.type === 'set') {
        return action.screen;
    }
    return _state;
}

export function useAppFlow({ settings, saveSettings }) {
    const [screen, dispatchScreen] = useReducer(
        screenReducer,
        SCREENS.LOADING
    );
    const [isOnboarding, setIsOnboarding] = useState(false);
    const [savedRadiusMeters, setSavedRadiusMeters] = useState(null);
    const setScreen = useCallback(
        (nextScreen) => dispatchScreen({ type: 'set', screen: nextScreen }),
        []
    );

    const requestPermissionsAndStartGeofencing = useCallback(async () => {
        const notificationGranted = await requestNotificationPermissions();
        if (!notificationGranted) {
            logger.warn('Notification permission denied');
            void captureEvent('permissions_notification_denied');
        }

        const foregroundGranted = await requestForegroundPermissions();
        if (!foregroundGranted) {
            logger.warn('Foreground location permission denied');
            void captureEvent('permissions_foreground_denied');
            return {
                foregroundGranted: false,
                backgroundGranted: false,
                geofencingStarted: false,
                reason: 'foreground_denied',
            };
        }

        if (Platform.OS === 'android' && Platform.Version >= 30) {
            Alert.alert(
                'Background Location Required',
                'Select "Allow all the time" on the next system prompt to enable reminders while the app is closed.'
            );
        }

        const background = await requestBackgroundPermissions();
        if (!background.granted) {
            logger.warn('Background location permission denied');
            void captureEvent('permissions_background_denied');
            return {
                foregroundGranted: true,
                backgroundGranted: false,
                geofencingStarted: false,
                reason: 'background_denied',
            };
        }

        const permissionSyncResult = await waitForBackgroundPermissionSync();
        if (!permissionSyncResult.backgroundGranted) {
            logger.warn('Background permission did not propagate after grant flow');
            void captureEvent('permission_propagation_retry_exhausted', {
                attemptsUsed: permissionSyncResult.attemptsUsed,
            });
            return {
                foregroundGranted: true,
                backgroundGranted: false,
                geofencingStarted: false,
                reason: 'background_not_propagated',
            };
        }

        if (permissionSyncResult.attemptsUsed > 1) {
            void captureEvent('permission_propagation_retry_used', {
                attemptsUsed: permissionSyncResult.attemptsUsed,
            });
        }

        const selectedStations = await getSelectedStations();
        const started = await startGeofencing(selectedStations);
        void captureEvent('geofencing_start_after_permission_flow', { started });

        if (!started) {
            return {
                foregroundGranted: true,
                backgroundGranted: true,
                geofencingStarted: false,
                reason: 'start_failed',
            };
        }

        return {
            foregroundGranted: true,
            backgroundGranted: true,
            geofencingStarted: true,
            reason: 'started',
        };
    }, []);

    const initializeApp = useCallback(async () => {
        try {
            configureNotificationHandler();
            await setupNotificationChannel();
            const runtimeSummary = await reconcileRuntimeState();
            void captureEvent('runtime_reconciled', runtimeSummary);

            const onboardingDone = await hasCompletedOnboarding();

            if (!onboardingDone) {
                setIsOnboarding(true);
                setScreen(SCREENS.STATIONS);
                return;
            }

            const currentSettings = await getUserSettings();
            setSavedRadiusMeters(currentSettings.geofenceRadiusMeters);

            const selectedStations = await getSelectedStations();
            const reconcileResult = await reconcileGeofencingState(selectedStations);
            void captureEvent('geofencing_reconciled', reconcileResult);

            let permissionsResult = {
                foregroundGranted: true,
                backgroundGranted: true,
                geofencingStarted: reconcileResult.active,
                reason: 'reconciled',
            };
            if (!reconcileResult.active) {
                permissionsResult = await requestPermissionsAndStartGeofencing();
            }
            void captureEvent('permission_flow_result', permissionsResult);

            if (!permissionsResult.foregroundGranted) {
                setScreen(SCREENS.HOME);
                return;
            }

            setScreen(SCREENS.HOME);
        } catch (error) {
            logger.error('Error initializing app:', error);
            setScreen(SCREENS.HOME);
        }
    }, [requestPermissionsAndStartGeofencing, setScreen]);

    useEffect(() => {
        initializeApp();
    }, [initializeApp]);

    useEffect(() => {
        if (!IS_NON_PROD && screen === SCREENS.DEBUG) {
            setScreen(SCREENS.SETTINGS);
        }
    }, [screen, setScreen]);

    const handleStationSelectionComplete = useCallback(async () => {
        if (isOnboarding) {
            setScreen(SCREENS.ONBOARDING_SETTINGS);
            return;
        }

        const selectedStations = await getSelectedStations();
        await startGeofencing(selectedStations);
        setScreen(SCREENS.HOME);
    }, [isOnboarding, setScreen]);

    const handleOnboardingSettingsSave = useCallback(async () => {
        await saveSettings();
        setSavedRadiusMeters(settings.geofenceRadiusMeters);
        await setOnboardingComplete();
        const permissionsResult = await requestPermissionsAndStartGeofencing();

        if (
            !permissionsResult.foregroundGranted ||
            !permissionsResult.backgroundGranted ||
            !permissionsResult.geofencingStarted
        ) {
            void captureEvent('onboarding_start_blocked_due_to_permissions', {
                reason: permissionsResult.reason,
            });
            Alert.alert(
                'Enable Background Location',
                'Monitoring requires "Always Allow" location access. Please grant background access and try again.'
            );
            return;
        }

        setIsOnboarding(false);
        setScreen(SCREENS.HOME);
    }, [
        requestPermissionsAndStartGeofencing,
        saveSettings,
        settings.geofenceRadiusMeters,
        setScreen,
    ]);

    const handleSettingsSave = useCallback(async () => {
        await saveSettings();

        if (
            savedRadiusMeters !== null &&
            settings.geofenceRadiusMeters !== savedRadiusMeters
        ) {
            const selectedStations = await getSelectedStations();
            await startGeofencing(selectedStations);
            logger.info(
                `Restarted geofencing with new radius: ${settings.geofenceRadiusMeters}m`
            );
        }
        setSavedRadiusMeters(settings.geofenceRadiusMeters);
    }, [saveSettings, savedRadiusMeters, settings.geofenceRadiusMeters]);

    return {
        screen,
        isOnboarding,
        setScreen,
        handleStationSelectionComplete,
        handleOnboardingSettingsSave,
        handleSettingsSave,
    };
}
