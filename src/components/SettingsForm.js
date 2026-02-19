import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

import PresetChips from './PresetChips';
import {
    RADIUS_PRESETS,
    DWELL_PRESETS,
    COOLDOWN_PRESETS,
    SETTINGS_LIMITS,
} from '../constants';
import {
    formatDistance,
    formatDuration,
    parseRadiusInput,
    parseDurationInput,
} from '../utils/units';
import { COLORS, FONTS } from '../theme/colors';

export default function SettingsForm({
    settings,
    onUpdateSetting,
    radiusDescription,
    dwellDescription,
    cooldownDescription,
    showNotificationPrivacy = false,
}) {
    const {
        geofenceRadiusMeters,
        dwellTimeMs,
        cooldownMs,
        useMetric,
        notificationPrivacyMode,
    } = settings;

    return (
        <>
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

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Geofence Radius</Text>
                <Text style={styles.sectionDescription}>{radiusDescription}</Text>
                <Text style={styles.currentValue}>
                    Current: {formatDistance(geofenceRadiusMeters, useMetric)}
                </Text>
                <PresetChips
                    presets={RADIUS_PRESETS}
                    selectedValue={geofenceRadiusMeters}
                    onSelect={(value) =>
                        onUpdateSetting('geofenceRadiusMeters', value)
                    }
                    customPlaceholder={useMetric ? 'Enter meters' : 'Enter feet'}
                    customUnit={useMetric ? 'm' : 'ft'}
                    parseCustom={(text) => parseRadiusInput(text, useMetric)}
                    useMetric={useMetric}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Dwell Time</Text>
                <Text style={styles.sectionDescription}>{dwellDescription}</Text>
                <Text style={styles.currentValue}>
                    Current: {formatDuration(dwellTimeMs)}
                </Text>
                <PresetChips
                    presets={DWELL_PRESETS}
                    selectedValue={dwellTimeMs}
                    onSelect={(value) => onUpdateSetting('dwellTimeMs', value)}
                    customPlaceholder="Enter seconds"
                    customUnit="sec"
                    parseCustom={(text) =>
                        parseDurationInput(text, 'seconds', {
                            minMs: SETTINGS_LIMITS.dwellTimeMs.min,
                            maxMs: SETTINGS_LIMITS.dwellTimeMs.max,
                        })
                    }
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notification Cooldown</Text>
                <Text style={styles.sectionDescription}>
                    {cooldownDescription}
                </Text>
                <Text style={styles.currentValue}>
                    Current: {formatDuration(cooldownMs)}
                </Text>
                <PresetChips
                    presets={COOLDOWN_PRESETS}
                    selectedValue={cooldownMs}
                    onSelect={(value) => onUpdateSetting('cooldownMs', value)}
                    customPlaceholder="Enter minutes"
                    customUnit="min"
                    parseCustom={(text) =>
                        parseDurationInput(text, 'minutes', {
                            minMs: SETTINGS_LIMITS.cooldownMs.min,
                            maxMs: SETTINGS_LIMITS.cooldownMs.max,
                        })
                    }
                />
            </View>

            {showNotificationPrivacy && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notification Privacy</Text>
                    <Text style={styles.sectionDescription}>
                        Hide station names on lockscreen notifications.
                    </Text>
                    <View style={styles.unitSwitchRow}>
                        <Text
                            style={[
                                styles.unitOption,
                                !notificationPrivacyMode &&
                                    styles.unitOptionActive,
                            ]}
                        >
                            Off
                        </Text>
                        <Switch
                            value={notificationPrivacyMode}
                            onValueChange={(value) =>
                                onUpdateSetting('notificationPrivacyMode', value)
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
                                notificationPrivacyMode &&
                                    styles.unitOptionActive,
                            ]}
                        >
                            On
                        </Text>
                    </View>
                </View>
            )}

            <Text style={styles.defaultsNote}>
                * indicates the recommended default value
            </Text>
        </>
    );
}

const styles = StyleSheet.create({
    section: {
        backgroundColor: COLORS.background,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 0,
        borderWidth: 1,
        borderColor: COLORS.primary,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: FONTS.pixel,
        color: COLORS.primary,
        letterSpacing: 1,
        marginBottom: 6,
    },
    sectionDescription: {
        fontSize: 14,
        color: COLORS.secondary,
        lineHeight: 20,
        marginBottom: 8,
    },
    currentValue: {
        fontFamily: FONTS.pixel,
        fontSize: 9,
        color: COLORS.primary,
        marginBottom: 4,
    },
    unitToggleRow: {
        alignItems: 'flex-start',
    },
    unitLabel: {
        fontFamily: FONTS.pixel,
        fontSize: 14,
        color: COLORS.primary,
    },
    unitSwitchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 10,
    },
    unitOption: {
        fontFamily: FONTS.pixel,
        fontSize: 9,
        color: COLORS.muted,
    },
    unitOptionActive: {
        color: COLORS.primary,
    },
    defaultsNote: {
        fontFamily: FONTS.pixel,
        fontSize: 8,
        color: COLORS.muted,
        textAlign: 'center',
        marginTop: 16,
        marginHorizontal: 16,
    },
});
