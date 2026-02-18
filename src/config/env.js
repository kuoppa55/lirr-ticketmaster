/**
 * Runtime environment helpers.
 */

const appEnv =
    process.env.EXPO_PUBLIC_APP_ENV ||
    process.env.APP_ENV ||
    'production';

export const APP_ENV = appEnv;
export const IS_PRODUCTION = APP_ENV === 'production';
export const IS_NON_PROD = !IS_PRODUCTION;

