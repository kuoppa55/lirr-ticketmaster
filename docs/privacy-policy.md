# Privacy Policy

Last updated: February 19, 2026

## Overview
LIRR Ticket Reminder provides location-based reminders to help users activate train tickets before boarding.

## Data We Process
- Precise location data (foreground and background) to evaluate proximity to selected LIRR stations.
- Local app settings such as geofence radius, dwell time, cooldown, station selection, and notification privacy mode.
- Runtime diagnostic events (errors and breadcrumbs) for reliability monitoring when enabled by deployment configuration.

## Data Storage and Retention
- Station selections, settings, cooldown timestamps, and pending dwell timer metadata are stored locally on device.
- The app does not require account creation.
- The app does not store payment data or train ticket purchase data.

## Background Location Use
Background location is used to detect geofence entry/exit while the app is not actively open, so reminders can still be delivered.

## Notifications
The app sends reminder notifications when geofence and dwell criteria are met.
- Notification Privacy Mode limits notification content to non-station-specific text.

## Data Sharing
- By default, core reminder data remains on-device.
- If telemetry endpoint configuration is enabled in production, diagnostic error/event payloads may be transmitted to the configured endpoint for reliability monitoring.

## Your Choices
- You can revoke location or notification permissions in system settings at any time.
- You can clear app data by uninstalling the app or via in-app reset/debug workflows where available.

## Contact
For support or privacy questions, contact: support@example.com
