/**
 * Home screen with central monitoring toggle button and compass radar.
 *
 * Minimal layout: header with gear icon, a large MonitoringButton in the
 * center, status text, compass radar showing nearby stations, cooldown bar,
 * and permission status dots at the bottom.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
    ScrollView,
    RefreshControl,
} from 'react-native';
import * as Location from 'expo-location';
import {
    isGeofencingActive,
    startGeofencing,
    stopGeofencing,
    checkPermissions,
} from '../services/geofencing';
import {
    getSelectedStations,
    getRemainingCooldown,
    getUserSettings,
} from '../services/storage';
import { MAJOR_JUNCTIONS } from '../data/stations';
import MonitoringButton from '../components/MonitoringButton';
import StatusIndicators from '../components/StatusIndicators';
import CompassRadar from '../components/CompassRadar';
import { useCompass } from '../hooks/useCompass';
import { useNearestStations } from '../hooks/useNearestStations';

/**
 * Home screen component.
 *
 * Args:
 *     onOpenSettings: Callback to navigate to settings screen.
 */
export default function HomeScreen({ onOpenSettings }) {
    const [isActive, setIsActive] = useState(false);
    const [permissions, setPermissions] = useState({
        foreground: false,
        background: false,
    });
    const [stationCount, setStationCount] = useState(0);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [location, setLocation] = useState(null);
    const [useMetric, setUseMetric] = useState(false);
    const locationSubRef = useRef(null);

    const { heading, available: compassAvailable } = useCompass(isActive);
    const nearestStations = useNearestStations(location, 5);

    const loadStatus = useCallback(async () => {
        const active = await isGeofencingActive();
        setIsActive(active);

        const perms = await checkPermissions();
        setPermissions(perms);

        const selected = await getSelectedStations();
        const totalCount = MAJOR_JUNCTIONS.length + selected.length;
        setStationCount(totalCount);

        const remaining = await getRemainingCooldown();
        setCooldownRemaining(remaining);

        const settings = await getUserSettings();
        setUseMetric(settings.useMetric ?? false);
    }, []);

    useEffect(() => {
        loadStatus();

        const interval = setInterval(() => {
            getRemainingCooldown().then(setCooldownRemaining);
        }, 60000);

        return () => clearInterval(interval);
    }, [loadStatus]);

    // Watch user position when monitoring is active
    useEffect(() => {
        if (!isActive) {
            if (locationSubRef.current) {
                locationSubRef.current.remove();
                locationSubRef.current = null;
            }
            setLocation(null);
            return;
        }

        let mounted = true;

        const startLocationWatch = async () => {
            try {
                const sub = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.Balanced,
                        timeInterval: 5000,
                        distanceInterval: 10,
                    },
                    (loc) => {
                        if (mounted) {
                            setLocation(loc.coords);
                        }
                    },
                );

                if (mounted) {
                    locationSubRef.current = sub;
                } else {
                    sub.remove();
                }
            } catch (error) {
                console.warn('Location watch failed:', error.message);
            }
        };

        startLocationWatch();

        return () => {
            mounted = false;
            if (locationSubRef.current) {
                locationSubRef.current.remove();
                locationSubRef.current = null;
            }
        };
    }, [isActive]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadStatus();
        setRefreshing(false);
    };

    const handleToggleMonitoring = async () => {
        if (isActive) {
            await stopGeofencing();
            setIsActive(false);
        } else {
            if (!permissions.background) {
                Alert.alert(
                    'Permission Required',
                    'Background location permission is needed to monitor stations when the app is closed.',
                    [{ text: 'OK' }],
                );
                return;
            }

            const selected = await getSelectedStations();
            const success = await startGeofencing(selected);
            setIsActive(success);

            if (!success) {
                Alert.alert(
                    'Error',
                    'Failed to start monitoring. Please check your permissions.',
                );
            }
        }
    };

    const formatCooldown = (ms) => {
        if (ms <= 0) return null;
        const minutes = Math.ceil(ms / 60000);
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return `${hours}h ${mins}m`;
        }
        return `${minutes}m`;
    };

    const cooldownText = formatCooldown(cooldownRemaining);
    const showCompass = isActive && compassAvailable && location;

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#999999"
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>LIRR Reminder</Text>
                    <TouchableOpacity
                        style={styles.settingsButton}
                        onPress={onOpenSettings}
                    >
                        <Text style={styles.settingsIcon}>{'\u2699'}</Text>
                    </TouchableOpacity>
                </View>

                {/* Status label */}
                <View style={styles.statusArea}>
                    <Text style={styles.statusText}>
                        {isActive ? 'Monitoring Active' : 'Monitoring Paused'}
                    </Text>
                    <Text style={styles.stationSubtitle}>
                        {stationCount} station{stationCount !== 1 ? 's' : ''}
                    </Text>
                </View>

                {/* Compass radar */}
                {showCompass ? (
                    <View style={styles.compassWrapper}>
                        <CompassRadar
                            heading={heading}
                            stations={nearestStations}
                            size={250}
                            useMetric={useMetric}
                        />
                    </View>
                ) : (
                    <View style={styles.compassFallback}>
                        <Text style={styles.compassFallbackText}>
                            {isActive
                                ? 'Waiting for compass...'
                                : 'Start monitoring to see nearby stations'}
                        </Text>
                    </View>
                )}

                {/* Monitoring toggle button */}
                <View style={styles.buttonArea}>
                    <MonitoringButton
                        isActive={isActive}
                        onToggle={handleToggleMonitoring}
                    />
                </View>

                {/* Cooldown bar */}
                {cooldownText && (
                    <View style={styles.cooldownBar}>
                        <Text style={styles.cooldownText}>
                            Cooldown: {cooldownText}
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Status indicators pinned to bottom */}
            <StatusIndicators
                permissions={permissions}
                isGeofencing={isActive}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#1A1A2E',
    },
    container: {
        flex: 1,
    },
    content: {
        flexGrow: 1,
        paddingBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    settingsButton: {
        padding: 8,
    },
    settingsIcon: {
        fontSize: 24,
        color: '#AAAAAA',
    },
    statusArea: {
        alignItems: 'center',
        paddingTop: 24,
        paddingBottom: 8,
    },
    statusText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    stationSubtitle: {
        fontSize: 14,
        color: '#888888',
        marginTop: 6,
    },
    compassWrapper: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    compassFallback: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    buttonArea: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    compassFallbackText: {
        fontSize: 13,
        color: '#666666',
        fontStyle: 'italic',
    },
    cooldownBar: {
        backgroundColor: 'rgba(255, 204, 0, 0.12)',
        borderRadius: 8,
        marginHorizontal: 32,
        marginBottom: 16,
        paddingVertical: 10,
        paddingHorizontal: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 204, 0, 0.25)',
    },
    cooldownText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFCC00',
    },
});
