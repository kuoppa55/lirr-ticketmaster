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
import { logger } from '../utils/logger';

const pendingDwellTimers = {};

TaskManager.defineTask(GEOFENCING_TASK_NAME, async ({ data, error }) => {
    if (error) {
        logger.error('Geofencing task error:', error);
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
        return;
    }

    if (eventType === Location.GeofencingEventType.Enter) {
        logger.info('Entered geofence');
        const station = findStationById(stationId);
        const stationName = station?.name || 'LIRR Station';
        await addPendingDwellTimer(stationId, stationName);
        const settings = await getUserSettings();

        pendingDwellTimers[stationId] = setTimeout(async () => {
            try {
                const inCooldown = await isInCooldown();
                if (inCooldown) {
                    logger.info('In cooldown period, skipping notification');
                    delete pendingDwellTimers[stationId];
                    await removePendingDwellTimer(stationId);
                    return;
                }

                await sendTicketReminder(stationName);
                logger.info('Notification sent');
                await setLastNotificationTime(Date.now());
            } catch (taskError) {
                logger.error('Error sending notification:', taskError);
            } finally {
                delete pendingDwellTimers[stationId];
                await removePendingDwellTimer(stationId);
            }
        }, settings.dwellTimeMs);
    } else if (eventType === Location.GeofencingEventType.Exit) {
        logger.info('Exited geofence');

        if (pendingDwellTimers[stationId]) {
            clearTimeout(pendingDwellTimers[stationId]);
            delete pendingDwellTimers[stationId];
            logger.info('Cancelled pending notification');
        }
        await removePendingDwellTimer(stationId);
    }
});
