# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LIRR Ticket Reminder is a React Native/Expo app that uses geofencing to remind users to activate their LIRR tickets when approaching train stations. The app monitors station proximity in the background and sends high-priority notifications. The home screen features a dark-themed UI with a large monitoring toggle button and a compass/radar showing the 5 nearest stations in real-time.

## Development Commands

```bash
# Start Expo development server
npm start

# Run on specific platform
npm run android
npm run ios

# Build with EAS
npm run build:dev:android    # Development APK
npm run build:dev:ios        # Development iOS build
npm run build:preview        # Preview build (both platforms)
npm run build:production     # Production build (both platforms)
```

## Architecture

### Core Flow
1. **App.js** - Entry point that defines the geofencing background task at module level (required for background execution) and handles app initialization/navigation
2. User selects stations during onboarding, then configures settings (radius, dwell time, cooldown)
3. Geofencing monitors selected stations in background using user-configured radius
4. On geofence entry, a dwell timer starts (user-configured duration, default 60s)
5. If user remains in geofence, notification fires (respecting user-configured cooldown, default 90 min)

### Navigation / Screen States (managed in App.js)
`loading` -> `stations` -> `onboarding-settings` -> `home` (onboarding flow)
`home` <-> `settings` <-> `debug` (post-onboarding)
`home` -> `stations` -> `home` (edit stations flow)

### Screens (`src/screens/`)
- **HomeScreen.js** - Dark-themed minimal UI: status label, compass radar, large circular monitoring toggle button, cooldown bar, permission status dots
- **StationSelectScreen.js** - Station selection by branch with search
- **SettingsConfigScreen.js** - Shared settings form (radius/dwell/cooldown presets + custom input, unit toggle) used in both onboarding and settings
- **SettingsScreen.js** - Full settings page with config form, edit stations button, and collapsible debug tools
- **DebugScreen.js** - Debug info (location, nearest geofence, etc.)

### Components (`src/components/`)
- **MonitoringButton.js** - 180px circular toggle with green glow (active) / dark (inactive), spring press animation, tap throttle
- **CompassRadar.js** - Radar visual with range rings, crosshairs, rotating N indicator, station dots positioned by bearing with logarithmic distance scaling, color-coded by proximity
- **StatusIndicators.js** - Small horizontal row of status dots (Location, Background, Geofencing)
- **PresetChips.js** - Reusable tappable chip row with custom input option for settings

### Hooks (`src/hooks/`)
- **useSettings.js** - Loads/saves user settings from AsyncStorage, provides `settings`, `updateSetting`, `saveSettings`, `resetToDefaults`
- **useCompass.js** - Subscribes to device heading via `Location.watchHeadingAsync`, returns `{ heading, available }`
- **useNearestStations.js** - Computes 5 closest monitored stations with distance and bearing from user location
- **useStationSelection.js** - Station selection state management
- **useDebugState.js** - Debug screen state, reads from user settings

### Services (`src/services/`)
- **geofencing.js** - Location permissions and geofence region management via `expo-location`; reads radius from user settings
- **notifications.js** - Notification channel setup and sending via `expo-notifications`
- **storage.js** - AsyncStorage persistence for selected stations, onboarding state, cooldown tracking, user settings, and pending dwell timers

### Utilities (`src/utils/`)
- **geo.js** - Haversine distance calculation, geofence proximity checks, distance formatting
- **bearing.js** - Forward azimuth (bearing) calculation and relative bearing for compass
- **units.js** - Metric/imperial conversion and formatting for distances and durations

### Key Constants (`src/constants/index.js`)
- `GEOFENCE_RADIUS`: 300 meters (default fallback)
- `DWELL_TIME_MS`: 60 seconds (default fallback)
- `GLOBAL_COOLDOWN_MS`: 90 minutes (default fallback)
- `IOS_MAX_REGIONS`: 20 (iOS geofencing limit)
- `DEFAULT_SETTINGS`: `{ geofenceRadiusMeters: 300, dwellTimeMs: 60000, cooldownMs: 5400000, useMetric: false }`
- `RADIUS_PRESETS`, `DWELL_PRESETS`, `COOLDOWN_PRESETS` - preset options for settings UI

All three configurable values (radius, dwell, cooldown) are user-configurable via the settings screen. The constants serve as fallbacks. The background task and services read live values from AsyncStorage via `getUserSettings()`.

### Station Data (`src/data/stations.js`)
- Contains all 124 LIRR stations with coordinates organized by branch
- `MAJOR_JUNCTIONS` (10 stations) are always monitored regardless of user selection
- iOS users can select up to 10 additional stations (20 total limit)
- Android has no practical limit

### Platform Differences
- **iOS**: Limited to 20 geofence regions total (10 major junctions + 10 user-selected)
- **Android**: No region limit; requires user to select "Allow all the time" for background location

## Testing Geofencing

Actual geofencing requires a physical device or GPS spoofing. Debug tools are accessible via Settings > Debug Tools:
- "Send Test Notification" - Verifies notification system
- "Simulate Station Entry" - Triggers full notification flow with cooldown
- Debug screen shows live location, nearest geofence, and geofence entry status

## Important Implementation Notes

- The `TaskManager.defineTask()` call in App.js MUST remain at module level (outside components) for background execution to work
- The background task reads user settings from AsyncStorage (available in background JS context) for dwell time - this async read happens once per geofence enter event
- Dwell timers are tracked both in-memory (`pendingDwellTimers` object) and persisted to AsyncStorage; in-memory timers don't survive process kills but persisted state does
- The notification channel on Android is configured with `bypassDnd: true` for critical alerts
- When the user changes geofence radius in settings, `startGeofencing()` is called again to re-register all regions with the new radius
- Compass/location subscriptions on HomeScreen only run while monitoring is active; cleanup is handled via `useEffect` returns
- The compass uses `Location.watchHeadingAsync` from expo-location (no additional dependency needed); it degrades gracefully on emulators without a magnetometer
