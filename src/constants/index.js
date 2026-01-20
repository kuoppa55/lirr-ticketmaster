/**
 * Application constants for LIRR Ticket Reminder App.
 */

// Task name for geofencing background task
export const GEOFENCING_TASK_NAME = 'LIRR_GEOFENCING_TASK';

// Geofence radius in meters
export const GEOFENCE_RADIUS = 300;

// Android notification channel ID
export const NOTIFICATION_CHANNEL_ID = 'lirr-ticket-alerts';

// Dwell time in milliseconds (60 seconds)
// User must remain in geofence for this duration before notification fires
export const DWELL_TIME_MS = 60000;

// Global cooldown in milliseconds (90 minutes)
// Minimum time between notifications
export const GLOBAL_COOLDOWN_MS = 5400000;

// AsyncStorage keys
export const STORAGE_KEYS = {
    SELECTED_STATIONS: '@lirr_selected_stations',
    ONBOARDING_COMPLETE: '@lirr_onboarding_complete',
    LAST_NOTIFICATION_TIME: '@lirr_last_notification_time',
};

// iOS maximum geofence regions
export const IOS_MAX_REGIONS = 20;

// Number of major junctions (always monitored)
export const MAJOR_JUNCTION_COUNT = 10;
