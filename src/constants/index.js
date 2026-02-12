/**
 * Application constants for LIRR Ticket Reminder App.
 */

// Task name for geofencing background task
export const GEOFENCING_TASK_NAME = 'LIRR_GEOFENCING_TASK';

// Geofence radius in meters (default fallback)
export const GEOFENCE_RADIUS = 300;

// Android notification channel ID
export const NOTIFICATION_CHANNEL_ID = 'lirr-ticket-alerts';

// Dwell time in milliseconds (default fallback)
export const DWELL_TIME_MS = 60000;

// Global cooldown in milliseconds (default fallback)
export const GLOBAL_COOLDOWN_MS = 5400000;

// AsyncStorage keys
export const STORAGE_KEYS = {
    SELECTED_STATIONS: '@lirr_selected_stations',
    ONBOARDING_COMPLETE: '@lirr_onboarding_complete',
    LAST_NOTIFICATION_TIME: '@lirr_last_notification_time',
    PENDING_DWELL_TIMERS: '@lirr_pending_dwell_timers',
    USER_SETTINGS: '@lirr_user_settings',
    SELECTED_THEME: '@lirr_selected_theme',
};

// iOS maximum geofence regions
export const IOS_MAX_REGIONS = 20;

// Number of major junctions (always monitored)
export const MAJOR_JUNCTION_COUNT = 10;

// Default user settings
export const DEFAULT_SETTINGS = {
    geofenceRadiusMeters: 300,
    dwellTimeMs: 60000,
    cooldownMs: 5400000,
    useMetric: false,
};

// Preset options for geofence radius
export const RADIUS_PRESETS = [
    { label: '~500 ft', labelMetric: '150 m', value: 150, isDefault: false },
    { label: '~1000 ft', labelMetric: '300 m', value: 300, isDefault: true },
    { label: '~1500 ft', labelMetric: '450 m', value: 450, isDefault: false },
];

// Preset options for dwell time
export const DWELL_PRESETS = [
    { label: '30 seconds', value: 30000, isDefault: false },
    { label: '1 minute', value: 60000, isDefault: true },
    { label: '2 minutes', value: 120000, isDefault: false },
];

// Preset options for cooldown
export const COOLDOWN_PRESETS = [
    { label: '30 minutes', value: 1800000, isDefault: false },
    { label: '90 minutes', value: 5400000, isDefault: true },
    { label: '3 hours', value: 10800000, isDefault: false },
];
