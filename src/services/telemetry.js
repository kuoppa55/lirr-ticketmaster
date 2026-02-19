import { APP_ENV, EXPO_PUBLIC_TELEMETRY_ENDPOINT, IS_PRODUCTION } from '../config/env';

const MAX_BREADCRUMBS = 75;
const sessionId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
const breadcrumbs = [];

function serializeError(error) {
    if (!error) {
        return null;
    }
    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
            stack: error.stack,
        };
    }
    return {
        message: String(error),
    };
}

function trimBreadcrumbs() {
    while (breadcrumbs.length > MAX_BREADCRUMBS) {
        breadcrumbs.shift();
    }
}

async function postTelemetry(payload) {
    if (!EXPO_PUBLIC_TELEMETRY_ENDPOINT) {
        return;
    }

    try {
        await fetch(EXPO_PUBLIC_TELEMETRY_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
    } catch {
        // Intentionally swallow telemetry transport failures.
    }
}

export function getTelemetryContext() {
    return {
        sessionId,
        appEnv: APP_ENV,
    };
}

export function addBreadcrumb(message, metadata) {
    const entry = {
        timestamp: Date.now(),
        message,
        metadata: metadata || null,
    };
    breadcrumbs.push(entry);
    trimBreadcrumbs();
}

export async function captureError(message, error, metadata) {
    addBreadcrumb(`error:${message}`, metadata);

    if (!IS_PRODUCTION) {
        return;
    }

    await postTelemetry({
        type: 'error',
        message,
        error: serializeError(error),
        metadata: metadata || null,
        context: getTelemetryContext(),
        breadcrumbs: [...breadcrumbs],
        timestamp: Date.now(),
    });
}

export async function captureEvent(eventName, metadata) {
    addBreadcrumb(`event:${eventName}`, metadata);

    if (!IS_PRODUCTION) {
        return;
    }

    await postTelemetry({
        type: 'event',
        eventName,
        metadata: metadata || null,
        context: getTelemetryContext(),
        timestamp: Date.now(),
    });
}
