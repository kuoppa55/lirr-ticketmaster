import { useState, useEffect, useCallback, useReducer } from 'react';
import { Alert, Platform } from 'react-native';

import { SCREENS } from '../constants/screens';
import {
    hasCompletedOnboarding,
    setOnboardingComplete,
    getSelectedStations,
    getUserSettings,
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
} from '../services/geofencing';
import { IS_NON_PROD } from '../config/env';
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
        }

        const foregroundGranted = await requestForegroundPermissions();
        if (!foregroundGranted) {
            logger.warn('Foreground location permission denied');
            return { foregroundGranted: false, backgroundGranted: false };
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
            return { foregroundGranted: true, backgroundGranted: false };
        }

        const selectedStations = await getSelectedStations();
        await startGeofencing(selectedStations);
        return { foregroundGranted: true, backgroundGranted: true };
    }, []);

    const initializeApp = useCallback(async () => {
        try {
            configureNotificationHandler();
            await setupNotificationChannel();

            const onboardingDone = await hasCompletedOnboarding();

            if (!onboardingDone) {
                setIsOnboarding(true);
                setScreen(SCREENS.STATIONS);
                return;
            }

            const currentSettings = await getUserSettings();
            setSavedRadiusMeters(currentSettings.geofenceRadiusMeters);

            const permissionsResult =
                await requestPermissionsAndStartGeofencing();
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
        setIsOnboarding(false);
        await requestPermissionsAndStartGeofencing();
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
