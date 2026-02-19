import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

import { GEOFENCING_TASK_NAME } from '../constants';
import { findStationById } from '../data/stations';
import { sendTicketReminder } from '../services/notifications';
import {
    isInCooldown,
    setLastNotificationTime,
    addPendingDwellTimer,
    removePendingDwellTimer,
    getUserSettings,
} from '../services/storage';
import { captureEvent, getTelemetryContext } from '../services/telemetry';
import { logger } from '../utils/logger';

const pendingDwellTimers = {};

TaskManager.defineTask(GEOFENCING_TASK_NAME, async ({ data, error }) => {
    const { sessionId } = getTelemetryContext();
    if (error) {
        logger.error('Geofencing task error:', error);
        void captureEvent('geofence_task_error', { sessionId });
        return;
    }

    if (!data) {
        return;
    }

    const { eventType, region } = data;
    const stationId = region?.identifier;

    if (!stationId) {
        logger.warn(
            'Geofencing task received event with missing region.identifier:',
            JSON.stringify({ eventType, region })
        );
        void captureEvent('geofence_event_missing_station_id', {
            sessionId,
            eventType,
        });
        return;
    }

    if (eventType === Location.GeofencingEventType.Enter) {
        if (pendingDwellTimers[stationId]) {
            logger.info(
                'Duplicate geofence enter received while dwell timer is active, ignoring',
                { stationId }
            );
            void captureEvent('geofence_enter_duplicate_ignored', {
                sessionId,
                stationId,
            });
            return;
        }

        logger.info('Entered geofence');
        void captureEvent('geofence_enter', { sessionId, stationId });
        const station = findStationById(stationId);
        const stationName = station?.name || 'LIRR Station';
        await addPendingDwellTimer(stationId, stationName);
        const settings = await getUserSettings();

        pendingDwellTimers[stationId] = setTimeout(async () => {
            try {
                const inCooldown = await isInCooldown();
                if (inCooldown) {
                    logger.info('In cooldown period, skipping notification');
                    void captureEvent('geofence_notification_skipped_cooldown', {
                        sessionId,
                        stationId,
                    });
                    delete pendingDwellTimers[stationId];
                    await removePendingDwellTimer(stationId);
                    return;
                }

                await sendTicketReminder(stationName);
                logger.info('Notification sent');
                void captureEvent('geofence_notification_sent', {
                    sessionId,
                    stationId,
                });
                await setLastNotificationTime(Date.now());
            } catch (taskError) {
                logger.error('Error sending notification:', taskError);
                void captureEvent('geofence_notification_failed', {
                    sessionId,
                    stationId,
                });
            } finally {
                delete pendingDwellTimers[stationId];
                await removePendingDwellTimer(stationId);
            }
        }, settings.dwellTimeMs);
    } else if (eventType === Location.GeofencingEventType.Exit) {
        logger.info('Exited geofence');
        void captureEvent('geofence_exit', { sessionId, stationId });

        if (pendingDwellTimers[stationId]) {
            clearTimeout(pendingDwellTimers[stationId]);
            delete pendingDwellTimers[stationId];
            logger.info('Cancelled pending notification');
        }
        await removePendingDwellTimer(stationId);
    }
});
