# Incident Response Runbook

## Trigger Conditions
- Crash spike after release.
- Reports of duplicate reminder notifications.
- Background monitoring silently stopping after permission state changes.

## Triage Steps
1. Confirm app version and platform affected.
2. Pull telemetry events for impacted sessions.
3. Check breadcrumbs for:
   - permission request outcomes,
   - geofence enter/exit events,
   - cooldown suppression events,
   - notification send failures.
4. Classify severity:
   - Sev 1: widespread crash or reminder storm.
   - Sev 2: limited user impact with workaround.
   - Sev 3: minor/non-blocking issue.

## Mitigation
- Sev 1: pause rollout, prepare emergency hotfix build.
- Sev 2: publish support guidance and schedule patch.
- Sev 3: backlog into next patch release.

## Hotfix Flow
1. Branch from latest production tag.
2. Implement minimal corrective patch.
3. Run full CI and targeted manual scenario checks.
4. Submit expedited release notes with issue summary and fix.

## Postmortem
- Document root cause, blast radius, timeline, and code/config preventions.
- Add regression test(s) or checklist items for recurrence prevention.
