describe('logger telemetry forwarding', () => {
    let consoleErrorSpy;
    let consoleWarnSpy;

    beforeEach(() => {
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
        jest.resetModules();
        jest.clearAllMocks();
    });

    test('error forwards Error objects to telemetry capture in production', () => {
        const captureError = jest.fn();

        jest.doMock('../src/config/env', () => ({
            IS_PRODUCTION: true,
        }));
        jest.doMock('../src/services/telemetry', () => ({
            addBreadcrumb: jest.fn(),
            captureError,
        }));

        const { logger } = require('../src/utils/logger');
        logger.error('boom', new Error('failure'));

        expect(captureError).toHaveBeenCalledWith(
            'boom',
            expect.any(Error)
        );
    });

    test('warn does not forward non-Error metadata to telemetry capture', () => {
        const captureError = jest.fn();

        jest.doMock('../src/config/env', () => ({
            IS_PRODUCTION: true,
        }));
        jest.doMock('../src/services/telemetry', () => ({
            addBreadcrumb: jest.fn(),
            captureError,
        }));

        const { logger } = require('../src/utils/logger');
        logger.warn('warn', { reason: 'test' });

        expect(captureError).not.toHaveBeenCalled();
    });
});
