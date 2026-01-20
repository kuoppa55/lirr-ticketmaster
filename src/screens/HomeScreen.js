/**
 * Home screen displaying monitoring status and controls.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Alert,
    ScrollView,
    RefreshControl,
} from 'react-native';
import {
    isGeofencingActive,
    startGeofencing,
    stopGeofencing,
    checkPermissions,
} from '../services/geofencing';
import { sendTestNotification, sendTicketReminder } from '../services/notifications';
import {
    getSelectedStations,
    getRemainingCooldown,
    isInCooldown,
    setLastNotificationTime,
} from '../services/storage';
import { MAJOR_JUNCTIONS } from '../data/stations';

/**
 * Home screen component.
 *
 * Args:
 *     onEditStations: Callback to navigate to station selection screen.
 */
export default function HomeScreen({ onEditStations }) {
    const [isActive, setIsActive] = useState(false);
    const [permissions, setPermissions] = useState({
        foreground: false,
        background: false,
    });
    const [stationCount, setStationCount] = useState(0);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

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
    }, []);

    useEffect(() => {
        loadStatus();

        // Update cooldown timer every minute
        const interval = setInterval(() => {
            getRemainingCooldown().then(setCooldownRemaining);
        }, 60000);

        return () => clearInterval(interval);
    }, [loadStatus]);

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
                    [{ text: 'OK' }]
                );
                return;
            }

            const selected = await getSelectedStations();
            const success = await startGeofencing(selected);
            setIsActive(success);

            if (!success) {
                Alert.alert(
                    'Error',
                    'Failed to start monitoring. Please check your permissions.'
                );
            }
        }
    };

    const handleTestNotification = async () => {
        try {
            await sendTestNotification();
            Alert.alert('Success', 'Test notification sent!');
        } catch (error) {
            Alert.alert('Error', 'Failed to send test notification.');
        }
    };

    // DEBUG: Simulate geofence entry to test full notification flow
    const handleSimulateStationEntry = async () => {
        try {
            const inCooldown = await isInCooldown();
            if (inCooldown) {
                Alert.alert(
                    'In Cooldown',
                    'Notification skipped due to cooldown. Wait for cooldown to expire or pull to refresh.'
                );
                return;
            }

            await sendTicketReminder('Babylon');
            await setLastNotificationTime(Date.now());
            await loadStatus(); // Refresh to show new cooldown
            Alert.alert('Success', 'Simulated station entry - notification sent!');
        } catch (error) {
            Alert.alert('Error', `Failed to simulate: ${error.message}`);
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

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View style={styles.header}>
                <Text style={styles.title}>LIRR Ticket Reminder</Text>
                <Text style={styles.subtitle}>
                    Never forget to activate your ticket
                </Text>
            </View>

            <View style={styles.statusCard}>
                <View
                    style={[
                        styles.statusIndicator,
                        isActive
                            ? styles.statusActive
                            : styles.statusInactive,
                    ]}
                />
                <Text style={styles.statusText}>
                    {isActive ? 'Monitoring Active' : 'Monitoring Paused'}
                </Text>
                <Text style={styles.stationCountText}>
                    {stationCount} stations being monitored
                </Text>
            </View>

            {cooldownText && (
                <View style={styles.cooldownCard}>
                    <Text style={styles.cooldownLabel}>
                        Notification Cooldown
                    </Text>
                    <Text style={styles.cooldownTime}>{cooldownText}</Text>
                    <Text style={styles.cooldownNote}>
                        Next notification available after cooldown
                    </Text>
                </View>
            )}

            <View style={styles.permissionsCard}>
                <Text style={styles.cardTitle}>Permissions</Text>
                <View style={styles.permissionRow}>
                    <Text style={styles.permissionLabel}>
                        Foreground Location
                    </Text>
                    <View
                        style={[
                            styles.permissionStatus,
                            permissions.foreground
                                ? styles.permissionGranted
                                : styles.permissionDenied,
                        ]}
                    >
                        <Text style={styles.permissionStatusText}>
                            {permissions.foreground ? 'Granted' : 'Denied'}
                        </Text>
                    </View>
                </View>
                <View style={styles.permissionRow}>
                    <Text style={styles.permissionLabel}>
                        Background Location
                    </Text>
                    <View
                        style={[
                            styles.permissionStatus,
                            permissions.background
                                ? styles.permissionGranted
                                : styles.permissionDenied,
                        ]}
                    >
                        <Text style={styles.permissionStatusText}>
                            {permissions.background ? 'Granted' : 'Denied'}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        isActive ? styles.buttonStop : styles.buttonStart,
                    ]}
                    onPress={handleToggleMonitoring}
                >
                    <Text style={styles.buttonText}>
                        {isActive ? 'Stop Monitoring' : 'Start Monitoring'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.buttonSecondary]}
                    onPress={onEditStations}
                >
                    <Text style={styles.buttonTextSecondary}>
                        Edit Stations
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.buttonOutline]}
                    onPress={handleTestNotification}
                >
                    <Text style={styles.buttonTextOutline}>
                        Send Test Notification
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.buttonDebug]}
                    onPress={handleSimulateStationEntry}
                >
                    <Text style={styles.buttonTextDebug}>
                        DEBUG: Simulate Station Entry
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>How It Works</Text>
                <Text style={styles.infoText}>
                    When you approach a monitored LIRR station, you'll receive a
                    reminder to activate your ticket. The app uses geofencing to
                    detect when you're within 300 meters of a station.
                </Text>
                <Text style={styles.infoText}>
                    A 60-second dwell time prevents false alerts when passing
                    by. After receiving a notification, there's a 90-minute
                    cooldown to avoid repeated alerts.
                </Text>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    {Platform.OS === 'ios'
                        ? 'iOS limits monitoring to 20 stations. Major junctions are always included.'
                        : 'All selected stations are monitored in the background.'}
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    content: {
        paddingBottom: 40,
    },
    header: {
        backgroundColor: '#0066CC',
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        color: '#FFFFFF',
        opacity: 0.9,
    },
    statusCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginTop: -20,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    statusIndicator: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginBottom: 12,
    },
    statusActive: {
        backgroundColor: '#00CC66',
    },
    statusInactive: {
        backgroundColor: '#FF6B6B',
    },
    statusText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333333',
        marginBottom: 4,
    },
    stationCountText: {
        fontSize: 14,
        color: '#666666',
    },
    cooldownCard: {
        backgroundColor: '#FFF9E6',
        marginHorizontal: 20,
        marginTop: 16,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFE066',
    },
    cooldownLabel: {
        fontSize: 14,
        color: '#996600',
        fontWeight: '600',
    },
    cooldownTime: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#CC8800',
        marginVertical: 4,
    },
    cooldownNote: {
        fontSize: 12,
        color: '#996600',
    },
    permissionsCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginTop: 16,
        borderRadius: 12,
        padding: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333333',
        marginBottom: 12,
    },
    permissionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    permissionLabel: {
        fontSize: 14,
        color: '#333333',
    },
    permissionStatus: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    permissionGranted: {
        backgroundColor: '#E6FFE6',
    },
    permissionDenied: {
        backgroundColor: '#FFE6E6',
    },
    permissionStatusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    actions: {
        paddingHorizontal: 20,
        marginTop: 24,
        gap: 12,
    },
    button: {
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    buttonStart: {
        backgroundColor: '#00CC66',
    },
    buttonStop: {
        backgroundColor: '#FF6B6B',
    },
    buttonSecondary: {
        backgroundColor: '#0066CC',
    },
    buttonOutline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#0066CC',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    buttonTextSecondary: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    buttonTextOutline: {
        color: '#0066CC',
        fontSize: 18,
        fontWeight: '600',
    },
    buttonDebug: {
        backgroundColor: '#FF9500',
    },
    buttonTextDebug: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    infoCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginTop: 24,
        borderRadius: 12,
        padding: 16,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333333',
        marginBottom: 12,
    },
    infoText: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
        marginBottom: 8,
    },
    footer: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    footerText: {
        fontSize: 12,
        color: '#999999',
        textAlign: 'center',
    },
});
