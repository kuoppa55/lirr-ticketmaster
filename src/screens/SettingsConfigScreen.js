/**
 * Settings configuration screen for LIRR Ticket Reminder App.
 * Shared form component used during onboarding and from the settings screen.
 * Allows users to configure geofence radius, dwell time, and cooldown.
 */

import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Switch,
} from 'react-native';

import PresetChips from '../components/PresetChips';
import { RADIUS_PRESETS, DWELL_PRESETS, COOLDOWN_PRESETS } from '../constants';
import {
    formatDistance,
    formatDuration,
    parseRadiusInput,
    parseDurationInput,
} from '../utils/units';

/**
 * SettingsConfigScreen component.
 *
 * Args:
 *     settings: Current settings object { geofenceRadiusMeters, dwellTimeMs, cooldownMs, useMetric }.
 *     onUpdateSetting: Callback to update a single setting (key, value).
 *     onSave: Callback when the user presses save/continue.
 *     isOnboarding: If true, shows "Continue" button. Otherwise shows "Save".
 */
export default function SettingsConfigScreen({
    settings,
    onUpdateSetting,
    onSave,
    isOnboarding = false,
}) {
    const { geofenceRadiusMeters, dwellTimeMs, cooldownMs, useMetric } =
        settings;

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
        >
            <View style={styles.header}>
                <Text style={styles.title}>
                    {isOnboarding
                        ? 'Configure Settings'
                        : 'Notification Settings'}
                </Text>
                {isOnboarding && (
                    <Text style={styles.subtitle}>
                        Customize how the app monitors stations. You can always
                        change these later in settings.
                    </Text>
                )}
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
                            trackColor={{ false: '#0066CC', true: '#0066CC' }}
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
                    How close to a station before we start watching? Larger
                    means earlier detection but more false positives.
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
                    How long you need to be near a station before you get
                    notified. Prevents false alerts when passing through.
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
                    Minimum wait between notifications. Prevents repeated alerts
                    for the same trip.
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
                * indicates the recommended default value
            </Text>

            {/* Save / Continue */}
            <TouchableOpacity style={styles.saveButton} onPress={onSave}>
                <Text style={styles.saveButtonText}>
                    {isOnboarding ? 'Continue' : 'Save Settings'}
                </Text>
            </TouchableOpacity>
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
        paddingBottom: 24,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    subtitle: {
        fontSize: 15,
        color: '#FFFFFF',
        opacity: 0.9,
        marginTop: 8,
        lineHeight: 22,
    },
    section: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#333333',
        marginBottom: 6,
    },
    sectionDescription: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
        marginBottom: 8,
    },
    currentValue: {
        fontSize: 13,
        color: '#0066CC',
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
        color: '#333333',
    },
    unitSwitchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    unitOption: {
        fontSize: 14,
        color: '#999999',
    },
    unitOptionActive: {
        color: '#0066CC',
        fontWeight: '600',
    },
    defaultsNote: {
        fontSize: 12,
        color: '#999999',
        textAlign: 'center',
        marginTop: 16,
        marginHorizontal: 16,
    },
    saveButton: {
        backgroundColor: '#00CC66',
        marginHorizontal: 16,
        marginTop: 24,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
});
