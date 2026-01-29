/**
 * Debug screen showing real-time location, geofence status, and notification state.
 */

import React, { useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    ActivityIndicator,
} from 'react-native';

import { useDebugState } from '../hooks/useDebugState';
import { formatDistance } from '../utils/geo';

/**
 * Format timestamp for display.
 *
 * Args:
 *     timestamp: Unix timestamp in milliseconds.
 *
 * Returns:
 *     Formatted time string (e.g., "10:32:45 AM").
 */
function formatTime(timestamp) {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
}

/**
 * Format milliseconds to human-readable duration.
 *
 * Args:
 *     ms: Duration in milliseconds.
 *
 * Returns:
 *     Formatted duration string (e.g., "45m remaining").
 */
function formatDuration(ms) {
    if (ms <= 0) return '0s';

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        const remainingMins = minutes % 60;
        return `${hours}h ${remainingMins}m`;
    }
    if (minutes > 0) {
        const remainingSecs = seconds % 60;
        return `${minutes}m ${remainingSecs}s`;
    }
    return `${seconds}s`;
}

/**
 * Status badge component.
 */
function StatusBadge({ granted }) {
    return (
        <View style={[styles.badge, granted ? styles.badgeGranted : styles.badgeDenied]}>
            <Text style={styles.badgeText}>{granted ? '\u2713' : '\u2717'}</Text>
        </View>
    );
}

/**
 * Section card component.
 */
function SectionCard({ title, children }) {
    return (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>{title}</Text>
            {children}
        </View>
    );
}

/**
 * Progress bar component for dwell timers.
 */
function ProgressBar({ progress }) {
    return (
        <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${Math.min(100, progress * 100)}%` }]} />
        </View>
    );
}

/**
 * Debug screen component.
 *
 * Args:
 *     onBack: Callback to navigate back to home screen.
 */
export default function DebugScreen({ onBack }) {
    const {
        location,
        locationError,
        locationTimestamp,
        permissions,
        isGeofencing,
        registeredRegions,
        nearbyGeofences,
        cooldownRemaining,
        lastNotificationTime,
        pendingDwellTimers,
        config,
        isLoading,
        refresh,
    } = useDebugState();

    // Calculate inside geofences
    const insideGeofences = useMemo(
        () => nearbyGeofences.filter((g) => g.isInside),
        [nearbyGeofences]
    );

    // Calculate nearby (but not inside) geofences, limited to 5
    const nearbyNotInside = useMemo(
        () => nearbyGeofences.filter((g) => !g.isInside).slice(0, 5),
        [nearbyGeofences]
    );

    // Calculate dwell timer display data
    const dwellTimerData = useMemo(() => {
        const now = Date.now();
        return Object.values(pendingDwellTimers).map((timer) => {
            const remaining = Math.max(0, timer.expiresAt - now);
            const elapsed = now - timer.startedAt;
            const total = timer.expiresAt - timer.startedAt;
            const progress = Math.min(1, elapsed / total);
            return {
                ...timer,
                remaining,
                progress,
            };
        });
    }, [pendingDwellTimers]);

    // Check if config values are debug values
    const isDebugDwellTime = config.dwellTimeMs < 60000;
    const isDebugCooldown = config.cooldownMs < 5400000;

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0066CC" />
                    <Text style={styles.loadingText}>Loading debug data...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backButtonText}>{'\u2190'} Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>DEBUG INFO</Text>
                <TouchableOpacity style={styles.refreshButton} onPress={refresh}>
                    <Text style={styles.refreshButtonText}>Refresh</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                {/* Current Location */}
                <SectionCard title="CURRENT LOCATION">
                    {locationError ? (
                        <Text style={styles.errorText}>Error: {locationError}</Text>
                    ) : location ? (
                        <>
                            <View style={styles.row}>
                                <Text style={styles.label}>Lat:</Text>
                                <Text style={styles.value}>{location.latitude.toFixed(7)}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Lon:</Text>
                                <Text style={styles.value}>{location.longitude.toFixed(7)}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Accuracy:</Text>
                                <Text style={styles.value}>
                                    {location.accuracy ? `${location.accuracy.toFixed(1)}m` : 'N/A'}
                                </Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Updated:</Text>
                                <Text style={styles.value}>{formatTime(locationTimestamp)}</Text>
                            </View>
                        </>
                    ) : (
                        <Text style={styles.noDataText}>Waiting for location...</Text>
                    )}
                </SectionCard>

                {/* Geofence Status */}
                <SectionCard title="GEOFENCE STATUS">
                    {insideGeofences.length > 0 ? (
                        insideGeofences.map((g) => (
                            <View key={g.identifier} style={styles.insideGeofenceRow}>
                                <Text style={styles.insideIndicator}>{'\u25CF'}</Text>
                                <Text style={styles.insideText}>
                                    INSIDE: {g.name} ({formatDistance(g.distance)})
                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noDataText}>Not inside any geofence</Text>
                    )}

                    {nearbyNotInside.length > 0 && (
                        <>
                            <Text style={styles.subTitle}>Nearby:</Text>
                            {nearbyNotInside.map((g) => (
                                <View key={g.identifier} style={styles.nearbyRow}>
                                    <Text style={styles.nearbyName}>{g.name}</Text>
                                    <Text style={styles.nearbyDistance}>
                                        {formatDistance(g.distance)}
                                    </Text>
                                </View>
                            ))}
                        </>
                    )}

                    <View style={styles.row}>
                        <Text style={styles.label}>Total Regions:</Text>
                        <Text style={styles.value}>{registeredRegions.length}</Text>
                    </View>
                </SectionCard>

                {/* Notification Conditions */}
                <SectionCard title="NOTIFICATION CONDITIONS">
                    <View style={styles.row}>
                        <Text style={styles.label}>Cooldown:</Text>
                        <Text
                            style={[
                                styles.value,
                                cooldownRemaining > 0 ? styles.warningText : styles.successText,
                            ]}
                        >
                            {cooldownRemaining > 0
                                ? `YES (${formatDuration(cooldownRemaining)} remaining)`
                                : 'NO'}
                        </Text>
                    </View>
                    {lastNotificationTime && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Last sent:</Text>
                            <Text style={styles.value}>{formatTime(lastNotificationTime)}</Text>
                        </View>
                    )}

                    <View style={styles.divider} />

                    <View style={styles.permissionRow}>
                        <Text style={styles.label}>Foreground Location:</Text>
                        <StatusBadge granted={permissions.foreground} />
                    </View>
                    <View style={styles.permissionRow}>
                        <Text style={styles.label}>Background Location:</Text>
                        <StatusBadge granted={permissions.background} />
                    </View>
                    <View style={styles.permissionRow}>
                        <Text style={styles.label}>Geofencing Active:</Text>
                        <StatusBadge granted={isGeofencing} />
                    </View>
                </SectionCard>

                {/* Pending Dwell Timers */}
                <SectionCard title="PENDING DWELL TIMERS">
                    {dwellTimerData.length > 0 ? (
                        dwellTimerData.map((timer) => (
                            <View key={timer.stationId} style={styles.timerCard}>
                                <Text style={styles.timerStation}>{timer.stationName}</Text>
                                <Text style={styles.timerRemaining}>
                                    Fires in: {formatDuration(timer.remaining)}
                                </Text>
                                <ProgressBar progress={timer.progress} />
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noDataText}>No pending timers</Text>
                    )}
                </SectionCard>

                {/* Configuration */}
                <SectionCard title="CONFIG (Debug Values!)">
                    <View style={styles.row}>
                        <Text style={styles.label}>Geofence Radius:</Text>
                        <Text style={styles.value}>{config.geofenceRadius}m</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Dwell Time:</Text>
                        <Text style={[styles.value, isDebugDwellTime && styles.debugWarning]}>
                            {formatDuration(config.dwellTimeMs)}
                            {isDebugDwellTime ? ' \u26A0\uFE0F' : ''}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Cooldown:</Text>
                        <Text style={[styles.value, isDebugCooldown && styles.debugWarning]}>
                            {formatDuration(config.cooldownMs)}
                            {isDebugCooldown ? ' \u26A0\uFE0F' : ''}
                        </Text>
                    </View>
                    {(isDebugDwellTime || isDebugCooldown) && (
                        <Text style={styles.debugNote}>
                            {'\u26A0\uFE0F'} Debug values active - not production settings
                        </Text>
                    )}
                </SectionCard>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666666',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#0066CC',
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    refreshButton: {
        padding: 8,
    },
    refreshButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingBottom: 32,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    cardTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#666666',
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    label: {
        fontSize: 14,
        color: '#333333',
    },
    value: {
        fontSize: 14,
        fontFamily: 'monospace',
        color: '#333333',
    },
    errorText: {
        color: '#CC0000',
        fontSize: 14,
    },
    noDataText: {
        color: '#999999',
        fontSize: 14,
        fontStyle: 'italic',
    },
    insideGeofenceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        backgroundColor: '#E6FFE6',
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 8,
    },
    insideIndicator: {
        color: '#00CC66',
        fontSize: 16,
        marginRight: 8,
    },
    insideText: {
        color: '#006633',
        fontSize: 14,
        fontWeight: '600',
    },
    subTitle: {
        fontSize: 12,
        color: '#666666',
        marginTop: 12,
        marginBottom: 8,
    },
    nearbyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    nearbyName: {
        fontSize: 14,
        color: '#333333',
    },
    nearbyDistance: {
        fontSize: 14,
        color: '#666666',
        fontFamily: 'monospace',
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 12,
    },
    permissionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
    badge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeGranted: {
        backgroundColor: '#00CC66',
    },
    badgeDenied: {
        backgroundColor: '#CC0000',
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    warningText: {
        color: '#CC8800',
    },
    successText: {
        color: '#00CC66',
    },
    timerCard: {
        backgroundColor: '#FFF9E6',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#FFE066',
    },
    timerStation: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 4,
    },
    timerRemaining: {
        fontSize: 12,
        color: '#996600',
        marginBottom: 8,
    },
    progressContainer: {
        height: 8,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#FFB800',
        borderRadius: 4,
    },
    debugWarning: {
        color: '#CC8800',
        fontWeight: '600',
    },
    debugNote: {
        marginTop: 12,
        fontSize: 12,
        color: '#CC8800',
        textAlign: 'center',
        fontStyle: 'italic',
    },
});
