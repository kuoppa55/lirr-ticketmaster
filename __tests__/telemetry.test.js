describe('telemetry service', () => {
    const originalFetch = global.fetch;

    afterEach(() => {
        global.fetch = originalFetch;
        jest.resetModules();
        jest.clearAllMocks();
    });

    test('captureError is a no-op transport in non-production', async () => {
        const fetchMock = jest.fn();
        global.fetch = fetchMock;

        jest.doMock('../src/config/env', () => ({
            APP_ENV: 'development',
            EXPO_PUBLIC_TELEMETRY_ENDPOINT: 'https://telemetry.example.com/ingest',
            IS_PRODUCTION: false,
        }));

        const telemetry = require('../src/services/telemetry');
        await telemetry.captureError('msg', new Error('x'));

        expect(fetchMock).not.toHaveBeenCalled();
    });

    test('captureEvent posts payload in production when endpoint configured', async () => {
        const fetchMock = jest.fn(async () => ({ ok: true }));
        global.fetch = fetchMock;

        jest.doMock('../src/config/env', () => ({
            APP_ENV: 'production',
            EXPO_PUBLIC_TELEMETRY_ENDPOINT: 'https://telemetry.example.com/ingest',
            IS_PRODUCTION: true,
        }));

        const telemetry = require('../src/services/telemetry');
        await telemetry.captureEvent('event_name', { foo: 'bar' });

        expect(fetchMock).toHaveBeenCalledWith(
            'https://telemetry.example.com/ingest',
            expect.objectContaining({
                method: 'POST',
            })
        );
    });

    test('captureError includes serialized error details in production payload', async () => {
        const fetchMock = jest.fn(async () => ({ ok: true }));
        global.fetch = fetchMock;

        jest.doMock('../src/config/env', () => ({
            APP_ENV: 'production',
            EXPO_PUBLIC_TELEMETRY_ENDPOINT: 'https://telemetry.example.com/ingest',
            IS_PRODUCTION: true,
        }));

        const telemetry = require('../src/services/telemetry');
        await telemetry.captureError('boom', new Error('failure'), { tag: 'x' });

        const [, request] = fetchMock.mock.calls[0];
        const payload = JSON.parse(request.body);
        expect(payload.type).toBe('error');
        expect(payload.error.message).toBe('failure');
        expect(payload.metadata).toEqual({ tag: 'x' });
    });
});
