/**
 * Settings screen from home.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    Linking,
} from 'react-native';

import SettingsForm from '../components/SettingsForm';
import { sendTestNotification, sendTicketReminder } from '../services/notifications';
import { isInCooldown, setLastNotificationTime } from '../services/storage';
import { COLORS, LED_GLOW, FONTS } from '../theme/colors';
import {
    IS_NON_PROD,
    EXPO_PUBLIC_PRIVACY_POLICY_URL,
    EXPO_PUBLIC_TERMS_URL,
} from '../config/env';

export default function SettingsScreen({
    settings,
    onUpdateSetting,
    onSave,
    onBack,
    onEditStations,
    onOpenDebug,
}) {
    const [showDebug, setShowDebug] = useState(false);

    const handleSave = async () => {
        await onSave();
        onBack();
    };

    const handleTestNotification = async () => {
        if (!IS_NON_PROD) {
            Alert.alert('Unavailable', 'Debug tools are disabled in production.');
            return;
        }
        try {
            await sendTestNotification();
            Alert.alert('Success', 'Test notification sent!');
        } catch {
            Alert.alert('Error', 'Failed to send test notification.');
        }
    };

    const handleSimulateStationEntry = async () => {
        if (!IS_NON_PROD) {
            Alert.alert('Unavailable', 'Debug tools are disabled in production.');
            return;
        }
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

    const openExternalLink = async (url, label) => {
        try {
            await Linking.openURL(url);
        } catch {
            Alert.alert('Error', `Unable to open ${label}.`);
        }
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>BACK</Text>
                </TouchableOpacity>
                <Text style={styles.title}>SETTINGS</Text>
                <View style={styles.headerSpacer} />
            </View>

            <SettingsForm
                settings={settings}
                onUpdateSetting={onUpdateSetting}
                radiusDescription="How close to a station before we start watching?"
                dwellDescription="How long near a station before you get notified."
                cooldownDescription="Minimum wait between notifications."
                showNotificationPrivacy={true}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={onEditStations}>
                <Text style={styles.actionButtonText}>Edit Stations</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.actionButton}
                onPress={() => openExternalLink(EXPO_PUBLIC_PRIVACY_POLICY_URL, 'Privacy Policy')}
            >
                <Text style={styles.actionButtonText}>Privacy Policy</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.actionButton}
                onPress={() => openExternalLink(EXPO_PUBLIC_TERMS_URL, 'Terms of Use')}
            >
                <Text style={styles.actionButtonText}>Terms of Use</Text>
            </TouchableOpacity>

            {IS_NON_PROD && (
                <>
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
                </>
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
        backgroundColor: COLORS.background,
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.primary,
    },
    backButton: {
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: 0,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    backButtonText: {
        fontFamily: FONTS.pixel,
        fontSize: 10,
        color: COLORS.primary,
    },
    title: {
        fontSize: 14,
        fontFamily: FONTS.pixel,
        color: COLORS.primary,
        ...LED_GLOW,
    },
    headerSpacer: {
        width: 60,
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
    actionButton: {
        backgroundColor: COLORS.background,
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 0,
        borderWidth: 1,
        borderColor: COLORS.primary,
        paddingVertical: 16,
        alignItems: 'center',
    },
    actionButtonText: {
        color: COLORS.primary,
        fontFamily: FONTS.pixel,
        fontSize: 12,
        letterSpacing: 1,
    },
    debugToggle: {
        marginHorizontal: 16,
        marginTop: 24,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.muted,
        borderRadius: 0,
    },
    debugToggleText: {
        fontFamily: FONTS.pixel,
        fontSize: 10,
        color: COLORS.muted,
    },
    debugSection: {
        marginHorizontal: 16,
        gap: 10,
    },
    debugButton: {
        backgroundColor: COLORS.background,
        borderRadius: 0,
        borderWidth: 1,
        borderColor: COLORS.primary,
        paddingVertical: 14,
        alignItems: 'center',
    },
    debugButtonText: {
        color: COLORS.primary,
        fontFamily: FONTS.pixel,
        fontSize: 10,
        letterSpacing: 1,
    },
});
