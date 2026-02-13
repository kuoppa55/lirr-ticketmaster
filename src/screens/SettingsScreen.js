/**
 * Full settings screen for LIRR Ticket Reminder App.
 * Accessible from the home screen. Contains settings config,
 * station editing, and debug tools.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Switch,
    Alert,
} from 'react-native';

import PresetChips from '../components/PresetChips';
import { RADIUS_PRESETS, DWELL_PRESETS, COOLDOWN_PRESETS } from '../constants';
import {
    formatDistance,
    formatDuration,
    parseRadiusInput,
    parseDurationInput,
} from '../utils/units';
import { sendTestNotification, sendTicketReminder } from '../services/notifications';
import {
    isInCooldown,
    setLastNotificationTime,
} from '../services/storage';
import { COLORS, LED_GLOW, FONTS } from '../theme/colors';

/**
 * SettingsScreen component.
 *
 * Args:
 *     settings: Current settings object.
 *     onUpdateSetting: Callback to update a single setting (key, value).
 *     onSave: Callback when user saves settings.
 *     onBack: Callback to navigate back to home.
 *     onEditStations: Callback to navigate to station edit screen.
 *     onOpenDebug: Callback to navigate to debug screen.
 */
export default function SettingsScreen({
    settings,
    onUpdateSetting,
    onSave,
    onBack,
    onEditStations,
    onOpenDebug,
}) {
    const [showDebug, setShowDebug] = useState(false);
    const { geofenceRadiusMeters, dwellTimeMs, cooldownMs, useMetric } =
        settings;

    const handleSave = async () => {
        await onSave();
        Alert.alert('Saved', 'Settings have been saved.');
    };

    const handleTestNotification = async () => {
        try {
            await sendTestNotification();
            Alert.alert('Success', 'Test notification sent!');
        } catch (error) {
            Alert.alert('Error', 'Failed to send test notification.');
        }
    };

    const handleSimulateStationEntry = async () => {
        try {
            const inCooldown = await isInCooldown();
            if (inCooldown) {
                Alert.alert(
                    'In Cooldown',
                    'Notification skipped due to cooldown.'
                );
                return;
            }

            await sendTicketReminder('Babylon');
            await setLastNotificationTime(Date.now());
            Alert.alert(
                'Success',
                'Simulated station entry - notification sent!'
            );
        } catch (error) {
            Alert.alert('Error', `Failed to simulate: ${error.message}`);
        }
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={onBack}
                    style={styles.backButton}
                >
                    <Text style={styles.backButtonText}>
                        {'\u2190'} Back
                    </Text>
                </TouchableOpacity>
                <Text style={styles.title}>Settings</Text>
            </View>

            {/* Unit Toggle */}
            <View style={styles.section}>
                <View style={styles.unitToggleRow}>
                    <Text style={styles.unitLabel}>Distance Units</Text>
                    <View style={styles.unitSwitchRow}>
                        <Text
                            style={[
                                styles.unitOption,
                                !useMetric && styles.unitOptionActive,
                            ]}
                        >
                            Imperial
                        </Text>
                        <Switch
                            value={useMetric}
                            onValueChange={(value) =>
                                onUpdateSetting('useMetric', value)
                            }
                            trackColor={{
                                false: COLORS.primary,
                                true: COLORS.primary,
                            }}
                            thumbColor="#FFFFFF"
                        />
                        <Text
                            style={[
                                styles.unitOption,
                                useMetric && styles.unitOptionActive,
                            ]}
                        >
                            Metric
                        </Text>
                    </View>
                </View>
            </View>

            {/* Geofence Radius */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Geofence Radius</Text>
                <Text style={styles.sectionDescription}>
                    How close to a station before we start watching?
                </Text>
                <Text style={styles.currentValue}>
                    Current: {formatDistance(geofenceRadiusMeters, useMetric)}
                </Text>
                <PresetChips
                    presets={RADIUS_PRESETS}
                    selectedValue={geofenceRadiusMeters}
                    onSelect={(value) =>
                        onUpdateSetting('geofenceRadiusMeters', value)
                    }
                    customPlaceholder={
                        useMetric ? 'Enter meters' : 'Enter feet'
                    }
                    customUnit={useMetric ? 'm' : 'ft'}
                    parseCustom={(text) => parseRadiusInput(text, useMetric)}
                    useMetric={useMetric}
                />
            </View>

            {/* Dwell Time */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Dwell Time</Text>
                <Text style={styles.sectionDescription}>
                    How long near a station before you get notified.
                </Text>
                <Text style={styles.currentValue}>
                    Current: {formatDuration(dwellTimeMs)}
                </Text>
                <PresetChips
                    presets={DWELL_PRESETS}
                    selectedValue={dwellTimeMs}
                    onSelect={(value) =>
                        onUpdateSetting('dwellTimeMs', value)
                    }
                    customPlaceholder="Enter seconds"
                    customUnit="sec"
                    parseCustom={(text) => parseDurationInput(text, 'seconds')}
                />
            </View>

            {/* Cooldown */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notification Cooldown</Text>
                <Text style={styles.sectionDescription}>
                    Minimum wait between notifications.
                </Text>
                <Text style={styles.currentValue}>
                    Current: {formatDuration(cooldownMs)}
                </Text>
                <PresetChips
                    presets={COOLDOWN_PRESETS}
                    selectedValue={cooldownMs}
                    onSelect={(value) =>
                        onUpdateSetting('cooldownMs', value)
                    }
                    customPlaceholder="Enter minutes"
                    customUnit="min"
                    parseCustom={(text) => parseDurationInput(text, 'minutes')}
                />
            </View>

            {/* Defaults note */}
            <Text style={styles.defaultsNote}>
                * indicates the recommended default
            </Text>

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save Settings</Text>
            </TouchableOpacity>

            {/* Edit Stations */}
            <TouchableOpacity
                style={styles.actionButton}
                onPress={onEditStations}
            >
                <Text style={styles.actionButtonText}>Edit Stations</Text>
            </TouchableOpacity>

            {/* Debug Tools */}
            <TouchableOpacity
                style={styles.debugToggle}
                onPress={() => setShowDebug(!showDebug)}
            >
                <Text style={styles.debugToggleText}>
                    Debug Tools {showDebug ? '\u25B2' : '\u25BC'}
                </Text>
            </TouchableOpacity>

            {showDebug && (
                <View style={styles.debugSection}>
                    <TouchableOpacity
                        style={styles.debugButton}
                        onPress={handleTestNotification}
                    >
                        <Text style={styles.debugButtonText}>
                            Send Test Notification
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.debugButton}
                        onPress={handleSimulateStationEntry}
                    >
                        <Text style={styles.debugButtonText}>
                            Simulate Station Entry
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.debugButton}
                        onPress={onOpenDebug}
                    >
                        <Text style={styles.debugButtonText}>
                            Open Debug Screen
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        paddingBottom: 40,
    },
    header: {
        backgroundColor: COLORS.surface,
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    backButton: {
        marginBottom: 8,
    },
    backButtonText: {
        fontSize: 16,
        color: COLORS.secondary,
    },
    title: {
        fontSize: 14,
        fontFamily: FONTS.pixel,
        color: COLORS.primary,
        ...LED_GLOW,
    },
    section: {
        backgroundColor: COLORS.surfaceElevated,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 10,
        fontFamily: FONTS.pixel,
        color: COLORS.primary,
        marginBottom: 6,
    },
    sectionDescription: {
        fontSize: 14,
        color: COLORS.secondary,
        lineHeight: 20,
        marginBottom: 8,
    },
    currentValue: {
        fontSize: 13,
        color: COLORS.primary,
        fontWeight: '600',
        marginBottom: 4,
    },
    unitToggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    unitLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.primary,
    },
    unitSwitchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    unitOption: {
        fontSize: 14,
        color: COLORS.muted,
    },
    unitOptionActive: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    defaultsNote: {
        fontSize: 12,
        color: COLORS.muted,
        textAlign: 'center',
        marginTop: 16,
        marginHorizontal: 16,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        marginHorizontal: 16,
        marginTop: 24,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    saveButtonText: {
        color: COLORS.background,
        fontSize: 18,
        fontWeight: '700',
    },
    actionButton: {
        backgroundColor: COLORS.secondary,
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    actionButtonText: {
        color: COLORS.background,
        fontSize: 18,
        fontWeight: '600',
    },
    debugToggle: {
        marginHorizontal: 16,
        marginTop: 24,
        paddingVertical: 12,
        alignItems: 'center',
    },
    debugToggleText: {
        fontSize: 14,
        color: COLORS.muted,
        fontWeight: '600',
    },
    debugSection: {
        marginHorizontal: 16,
        gap: 10,
    },
    debugButton: {
        backgroundColor: COLORS.secondary,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    debugButtonText: {
        color: COLORS.background,
        fontSize: 16,
        fontWeight: '600',
    },
});
