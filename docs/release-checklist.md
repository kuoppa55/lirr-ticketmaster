# Release Checklist

## Pre-Release Gates
- [ ] CI workflow (`lint`, `test`, `coverage`) green on main.
- [ ] Security audit workflow green (no high/critical production dependency findings).
- [ ] Expo config smoke workflow green.
- [ ] iOS physical validation checklist completed.
- [ ] Android physical validation checklist completed.
- [ ] Privacy Policy and Terms links configured to public URLs.
- [ ] Store metadata/screenshots reviewed.

## Configuration
- [ ] `APPLE_ID`, `ASC_APP_ID`, `APPLE_TEAM_ID` secrets configured for iOS submit.
- [ ] `GOOGLE_SERVICE_ACCOUNT_KEY_PATH` configured for Android submit.
- [ ] `EXPO_PUBLIC_APP_ENV=production` configured in production profile.
- [ ] `EXPO_PUBLIC_TELEMETRY_ENDPOINT` configured (or intentionally blank with documented rationale).

## Rollout
- [ ] iOS phased release enabled.
- [ ] Android internal track verification complete.
- [ ] Closed-testing acceptance complete before production rollout.

## Post-Release Monitoring (first 72h)
- [ ] Crash/error feed reviewed daily.
- [ ] No duplicate-notification incidents.
- [ ] No high-severity permission regression reports.
