/**
 * Settings configuration screen for onboarding.
 */

import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
} from 'react-native';

import SettingsForm from '../components/SettingsForm';
import { COLORS, LED_GLOW, FONTS } from '../theme/colors';

export default function SettingsConfigScreen({
    settings,
    onUpdateSetting,
    onSave,
    isOnboarding = false,
}) {
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

            <SettingsForm
                settings={settings}
                onUpdateSetting={onUpdateSetting}
                radiusDescription="How close to a station before we start watching? Larger means earlier detection but more false positives."
                cooldownDescription="Minimum wait between notifications. Prevents repeated alerts for the same trip."
            />

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
        backgroundColor: COLORS.background,
    },
    content: {
        paddingBottom: 40,
    },
    header: {
        backgroundColor: COLORS.background,
        paddingTop: 60,
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.primary,
    },
    title: {
        fontSize: 14,
        fontFamily: FONTS.pixel,
        color: COLORS.primary,
        ...LED_GLOW,
    },
    subtitle: {
        fontSize: 15,
        color: COLORS.secondary,
        marginTop: 8,
        lineHeight: 22,
    },
    saveButton: {
        backgroundColor: COLORS.background,
        marginHorizontal: 16,
        marginTop: 24,
        borderRadius: 0,
        borderWidth: 1,
        borderColor: COLORS.primary,
        paddingVertical: 16,
        alignItems: 'center',
    },
    saveButtonText: {
        color: COLORS.primary,
        fontFamily: FONTS.pixel,
        fontSize: 12,
        letterSpacing: 1,
    },
});
