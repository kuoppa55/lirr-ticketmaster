/**
 * Minimal logger that suppresses non-essential logs in production.
 */

import { IS_PRODUCTION } from '../config/env';

function toErrorMeta(error) {
    if (!error) return undefined;
    return {
        name: error.name,
        message: error.message,
    };
}

function write(method, message, meta) {
    const writeMessage = (fn) => {
        if (meta === undefined) {
            fn(message);
            return;
        }
        fn(message, meta);
    };

    if (method === 'log') {
        writeMessage(console.log);
        return;
    }
    if (method === 'warn') {
        writeMessage(console.warn);
        return;
    }
    if (method === 'error') {
        writeMessage(console.error);
    }
}

export const logger = {
    debug(message, meta) {
        if (!IS_PRODUCTION) write('log', message, meta);
    },
    info(message, meta) {
        if (!IS_PRODUCTION) write('log', message, meta);
    },
    warn(message, meta) {
        if (IS_PRODUCTION && meta instanceof Error) {
            write('warn', message, toErrorMeta(meta));
            return;
        }
        write('warn', message, meta);
    },
    error(message, meta) {
        if (IS_PRODUCTION && meta instanceof Error) {
            write('error', message, toErrorMeta(meta));
            return;
        }
        write('error', message, meta);
    },
};
