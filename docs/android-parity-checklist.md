# Android Parity Checklist (Deferred)

## Status
Deferred until Android device access is available.

## Goal
Confirm parity with iOS reliability behavior for geofencing reminders.

## Required Android Checks
- Background location permission flow includes "Allow all the time" path.
- Notification channel exists and high-priority reminder notifications are visible.
- Enter triggers one reminder when cooldown is inactive.
- Repeated enters during cooldown do not trigger extra reminders.
- Global cooldown suppresses reminders for all stations during cooldown window.
- Privacy mode notification content is station-agnostic.

## Result Template
| Scenario | Pass/Fail | Notes |
| --- | --- | --- |
| Permission Flow (Android) |  |  |
| Notification Channel |  |  |
| Enter Notification |  |  |
| Cooldown Suppression |  |  |
| Global Cooldown |  |  |
| Privacy Mode |  |  |
