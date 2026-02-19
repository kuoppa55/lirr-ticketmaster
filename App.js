/**
 * LIRR Ticket Reminder App.
 */

import React from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';

import './src/background/geofenceTask';
import { useSettings } from './src/hooks/useSettings';
import { useAppFlow } from './src/hooks/useAppFlow';
import { IS_NON_PROD } from './src/config/env';
import { SCREENS } from './src/constants/screens';

import HomeScreen from './src/screens/HomeScreen';
import StationSelectScreen from './src/screens/StationSelectScreen';
import DebugScreen from './src/screens/DebugScreen';
import SettingsConfigScreen from './src/screens/SettingsConfigScreen';
import SettingsScreen from './src/screens/SettingsScreen';

export default function App() {
    const {
        settings,
        loading: settingsLoading,
        updateSetting,
        saveSettings,
    } = useSettings();

    const {
        screen,
        isOnboarding,
        setScreen,
        handleStationSelectionComplete,
        handleOnboardingSettingsSave,
        handleSettingsSave,
    } = useAppFlow({ settings, saveSettings });

    const [fontsLoaded, fontError] = useFonts({
        PressStart2P_400Regular,
    });

    const fontsReady = fontsLoaded || !!fontError;

    if (
        screen === SCREENS.LOADING ||
        settingsLoading ||
        !fontsReady
    ) {
        return (
            <View style={styles.loadingScreen}>
                <StatusBar barStyle="light-content" />
                <ActivityIndicator size="large" color="#FF8C00" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    if (screen === SCREENS.STATIONS) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <StationSelectScreen
                    onComplete={handleStationSelectionComplete}
                    isOnboarding={isOnboarding}
                    onBack={isOnboarding ? null : () => setScreen(SCREENS.SETTINGS)}
                />
            </View>
        );
    }

    if (screen === SCREENS.ONBOARDING_SETTINGS) {
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

    if (screen === SCREENS.SETTINGS) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <SettingsScreen
                    settings={settings}
                    onUpdateSetting={updateSetting}
                    onSave={handleSettingsSave}
                    onBack={() => setScreen(SCREENS.HOME)}
                    onEditStations={() => setScreen(SCREENS.STATIONS)}
                    onOpenDebug={() => {
                        if (IS_NON_PROD) {
                            setScreen(SCREENS.DEBUG);
                        }
                    }}
                />
            </View>
        );
    }

    if (screen === SCREENS.DEBUG && IS_NON_PROD) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <DebugScreen onBack={() => setScreen(SCREENS.SETTINGS)} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <HomeScreen onOpenSettings={() => setScreen(SCREENS.SETTINGS)} />
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
