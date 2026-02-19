# Production Readiness Plan (Implemented)

This document tracks the non-feature hardening completed for production readiness.

## Completed
- Added CI quality workflow (`.github/workflows/ci.yml`) for lint + tests + coverage.
- Added Expo config smoke workflow (`.github/workflows/expo-config-smoke.yml`).
- Added telemetry service with session context, breadcrumbs, and production error/event transport.
- Wired telemetry into logger, permission flow, geofencing lifecycle, and notification flow.
- Added startup runtime reconciliation for pending dwell timers and geofencing state.
- Added compliance docs and in-app links for Privacy Policy and Terms.
- Normalized duplicate iOS background mode and Android permission declarations in `app.json`.
- Replaced placeholder submit values in `eas.json` with env-variable references.

## Remaining External Steps
- Configure telemetry endpoint value for production (`EXPO_PUBLIC_TELEMETRY_ENDPOINT`).
- Host privacy policy and terms at final public URLs and set:
  - `EXPO_PUBLIC_PRIVACY_POLICY_URL`
  - `EXPO_PUBLIC_TERMS_URL`
- Set EAS submit secrets/variables for Apple and Google Play.
- Enable branch protections requiring CI/security checks.
- Complete iOS and Android physical validation checklists.
