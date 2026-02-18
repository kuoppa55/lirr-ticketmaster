/**
 * Notification service for LIRR Ticket Reminder App.
 * Handles notification permissions, channel setup, and sending notifications.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NOTIFICATION_CHANNEL_ID } from '../constants';
import { IS_NON_PROD } from '../config/env';
import { getUserSettings } from './storage';

/**
 * Configure how notifications are handled when the app is in the foreground.
 * Sets notifications to show alert, play sound, and set badge.
 */
export function configureNotificationHandler() {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
        }),
    });
}

/**
 * Set up the Android notification channel with maximum importance.
 * Required for Android to display high-priority notifications.
 *
 * Returns:
 *     Promise that resolves when channel is created.
 */
export async function setupNotificationChannel() {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(
            NOTIFICATION_CHANNEL_ID,
            {
                name: 'LIRR Ticket Alerts',
                description:
                    'High-priority alerts to remind you to activate your LIRR ticket',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#0066CC',
                lockscreenVisibility:
                    Notifications.AndroidNotificationVisibility.PRIVATE,
                sound: 'default',
            }
        );
    }
}

/**
 * Request notification permissions from the user.
 *
 * Returns:
 *     True if permissions granted, false otherwise.
 */
export async function requestNotificationPermissions() {
    const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

    if (existingStatus === 'granted') {
        return true;
    }

    const { status } = await Notifications.requestPermissionsAsync({
        ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowCriticalAlerts: IS_NON_PROD,
        },
    });

    return status === 'granted';
}

/**
 * Send a high-priority ticket reminder notification.
 *
 * Args:
 *     stationName: Name of the station the user is approaching.
 *
 * Returns:
 *     Promise that resolves with the notification identifier.
 */
export async function sendTicketReminder(stationName) {
    const settings = await getUserSettings();
    const privacyMode = settings.notificationPrivacyMode === true;

    const title = privacyMode
        ? 'LIRR Ticket Reminder'
        : 'Activate Your LIRR Ticket!';
    const body = privacyMode
        ? 'You may be approaching a station. Open the app to view details.'
        : `You're at ${stationName}. Don't forget to activate your ticket before boarding!`;

    const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.HIGH,
            ...(Platform.OS === 'android' && {
                channelId: NOTIFICATION_CHANNEL_ID,
            }),
            data: {
                type: 'ticket-reminder',
            },
        },
        trigger: null, // Immediate notification
    });

    return notificationId;
}

/**
 * Send a test notification to verify the notification system is working.
 *
 * Returns:
 *     Promise that resolves with the notification identifier.
 */
export async function sendTestNotification() {
    const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Test Notification',
            body: 'Notifications are working correctly!',
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.HIGH,
            ...(Platform.OS === 'android' && {
                channelId: NOTIFICATION_CHANNEL_ID,
            }),
        },
        trigger: null,
    });

    return notificationId;
}

/**
 * Cancel all pending notifications.
 *
 * Returns:
 *     Promise that resolves when notifications are cancelled.
 */
export async function cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
}
