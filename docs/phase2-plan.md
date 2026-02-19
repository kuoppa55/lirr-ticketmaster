# Phase 2 Spec: Reliability-First Hardening

## Summary
Phase 2 focuses on runtime reliability for background geofencing and notifications, plus high-risk test coverage and physical iOS validation.

## Key Invariants
- Cooldown is global (any station trigger starts one shared cooldown window).
- Cooldown is never per-station.
- Duplicate geofence enter events for the same station must not schedule duplicate dwell timers.

## Deliverables
1. Reliability hardening in `src/background/geofenceTask.js` and services.
2. New Jest suites for background task and service boundaries.
3. Expanded storage tests for pending timer persistence and global cooldown behavior.
4. iOS validation runbook and deferred Android parity checklist.

## Acceptance Criteria
- `npm run lint` passes.
- `npm test` passes.
- New tests verify:
  - duplicate-enter suppression,
  - global cooldown across different stations,
  - permission/failure paths in geofencing and notifications,
  - pending dwell timer persistence filtering.
- iOS validation checklist exists and is ready for execution.
