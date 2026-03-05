# iOS Validation Runbook (Phase 2)

## Purpose
Validate reliability-critical geofencing and notification behavior on physical iPhone hardware.

## Test Environment
- Device model:
- iOS version:
- App build/profile:
- Date/time:
- Tester:

## Preconditions
- Monitoring is enabled in app.
- At least 2 stations are selected for tracking.
- Notification permissions are granted.
- Foreground and background location permissions are granted.
- Cooldown settings are known and recorded before test.

## Required Scenarios

### 1. Permission Flow
- Verify app behavior when permissions are granted.
- Verify app behavior when permissions are denied/revoked and then restored.
- Expected result: monitoring state and status indicators remain accurate.

### 2. Enter Triggers One Notification
- Enter a tracked station geofence.
- Expected result: exactly one reminder notification is delivered.

### 3. Exit Event Does Not Trigger Additional Notify
- Enter a tracked station, receive the reminder, then exit.
- Expected result: exit does not trigger a second reminder notification.

### 4. Global Cooldown Across Stations
- Trigger a reminder at Station A.
- Before cooldown expires, enter Station B.
- Expected result: no second reminder is delivered.
- Note: cooldown is global, not per station.

### 5. Privacy Mode Content
- Enable Notification Privacy mode.
- Trigger reminder flow.
- Expected result: notification uses privacy-safe copy and does not include station-specific details.

## Evidence Checklist
- [ ] Scenario 1 pass/fail + notes
- [ ] Scenario 2 pass/fail + notes
- [ ] Scenario 3 pass/fail + notes
- [ ] Scenario 4 pass/fail + notes
- [ ] Scenario 5 pass/fail + notes

## Results Log
| Scenario | Pass/Fail | Notes |
| --- | --- | --- |
| Permission Flow |  |  |
| Enter Notification |  |  |
| Exit Behavior |  |  |
| Global Cooldown |  |  |
| Privacy Mode |  |  |
