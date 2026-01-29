# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LIRR Ticket Reminder is a React Native/Expo app that uses geofencing to remind users to activate their LIRR tickets when approaching train stations. The app monitors station proximity in the background and sends high-priority notifications.

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
2. User selects stations during onboarding or via edit flow
3. Geofencing monitors selected stations in background
4. On geofence entry, a 60-second dwell timer starts
5. If user remains in geofence, notification fires (respecting 90-minute cooldown)

### Services (`src/services/`)
- **geofencing.js** - Location permissions and geofence region management via `expo-location`
- **notifications.js** - Notification channel setup and sending via `expo-notifications`
- **storage.js** - AsyncStorage persistence for selected stations, onboarding state, and cooldown tracking

### Key Constants (`src/constants/index.js`)
- `GEOFENCE_RADIUS`: 300 meters
- `DWELL_TIME_MS`: 60 seconds (currently 5s for testing)
- `GLOBAL_COOLDOWN_MS`: 90 minutes (currently 5s for testing)
- `IOS_MAX_REGIONS`: 20 (iOS geofencing limit)

### Station Data (`src/data/stations.js`)
- Contains all 124 LIRR stations with coordinates organized by branch
- `MAJOR_JUNCTIONS` (10 stations) are always monitored regardless of user selection
- iOS users can select up to 10 additional stations (20 total limit)
- Android has no practical limit

### Platform Differences
- **iOS**: Limited to 20 geofence regions total (10 major junctions + 10 user-selected)
- **Android**: No region limit; requires user to select "Allow all the time" for background location

## Testing Geofencing

Actual geofencing requires a physical device or GPS spoofing. The HomeScreen includes debug buttons:
- "Send Test Notification" - Verifies notification system
- "DEBUG: Simulate Station Entry" - Triggers full notification flow with cooldown

## Important Implementation Notes

- The `TaskManager.defineTask()` call in App.js MUST remain at module level (outside components) for background execution to work
- Dwell timers are in-memory only (`pendingDwellTimers` object) - they don't persist if the app process is killed
- The notification channel on Android is configured with `bypassDnd: true` for critical alerts
