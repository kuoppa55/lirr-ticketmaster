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
import LEDText from '../components/LEDText';
import { useCompass } from '../hooks/useCompass';
import { useNearestStations } from '../hooks/useNearestStations';
import { COLORS, FONTS, TYPOGRAPHY } from '../theme/colors';
import { formatDistance } from '../utils/units';

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

    const getMarqueeText = () => {
        if (!isActive) {
            return '  MONITORING PAUSED  ---  TAP BUTTON TO START  ---  LIRR TICKET REMINDER  ';
        }
        if (nearestStations.length === 0) {
            return '  SCANNING FOR STATIONS  ---  WAITING FOR LOCATION  ---  ACTIVATE YOUR TICKET  ';
        }
        const nearest = nearestStations[0];
        const next = nearestStations.length > 1 ? nearestStations[1] : null;
        const dist = formatDistance(nearest.distance, useMetric);
        if (next) {
            return `  NOW APPROACHING: ${nearest.name.toUpperCase()} (${dist})  ---  NEXT STOP: ${next.name.toUpperCase()}  ---  ACTIVATE YOUR TICKET  `;
        }
        return `  NOW APPROACHING: ${nearest.name.toUpperCase()} (${dist})  ---  ACTIVATE YOUR TICKET  `;
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={COLORS.primary}
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.titleBox}>
                        <LEDText text="LIRR" style={styles.titleLarge} flicker={true} />
                        <LEDText text="REMINDER" style={styles.titleSmall} flicker={true} />
                    </View>
                    <TouchableOpacity
                        style={styles.settingsButton}
                        onPress={onOpenSettings}
                    >
                        <Text style={styles.settingsIcon}>{'\u2699'}</Text>
                    </TouchableOpacity>
                </View>

                {/* Status label */}
                <View style={styles.statusArea}>
                    <LEDText
                        text={isActive ? 'MONITORING ACTIVE' : 'MONITORING PAUSED'}
                        style={styles.statusText}
                        flicker={isActive}
                    />
                    <Text style={styles.stationSubtitle}>
                        {stationCount} STATION{stationCount !== 1 ? 'S' : ''}
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

                {/* Scrolling marquee */}
                <View style={styles.marqueeWrapper}>
                    <LEDText
                        text={getMarqueeText()}
                        style={styles.marqueeText}
                        scroll={true}
                        flicker={isActive}
                        containerWidth={280}
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
        backgroundColor: COLORS.background,
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
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
    },
    titleBox: {
        borderWidth: 1,
        borderColor: COLORS.primary,
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    titleLarge: {
        fontSize: TYPOGRAPHY.titleSize,
        letterSpacing: TYPOGRAPHY.letterSpacing,
    },
    titleSmall: {
        fontSize: TYPOGRAPHY.headingSize,
        letterSpacing: TYPOGRAPHY.letterSpacing,
        marginTop: 4,
    },
    settingsButton: {
        padding: 8,
        marginTop: 8,
    },
    settingsIcon: {
        fontSize: 24,
        color: COLORS.secondary,
    },
    statusArea: {
        alignItems: 'center',
        paddingTop: 24,
        paddingBottom: 8,
    },
    statusText: {
        fontSize: TYPOGRAPHY.bodySize,
    },
    stationSubtitle: {
        fontSize: TYPOGRAPHY.smallSize,
        fontFamily: FONTS.pixel,
        color: COLORS.muted,
        letterSpacing: TYPOGRAPHY.letterSpacing,
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
    marqueeWrapper: {
        width: 280,
        alignSelf: 'center',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: COLORS.muted,
        paddingVertical: 6,
        marginBottom: 16,
    },
    marqueeText: {
        fontSize: TYPOGRAPHY.bodySize,
        color: COLORS.primary,
    },
    compassFallbackText: {
        fontSize: 13,
        color: COLORS.muted,
        fontStyle: 'italic',
    },
    cooldownBar: {
        backgroundColor: COLORS.cooldownBg,
        borderRadius: 8,
        marginHorizontal: 32,
        marginBottom: 16,
        paddingVertical: 10,
        paddingHorizontal: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.cooldownBorder,
    },
    cooldownText: {
        fontSize: TYPOGRAPHY.smallSize,
        fontFamily: FONTS.pixel,
        color: COLORS.primary,
    },
});
