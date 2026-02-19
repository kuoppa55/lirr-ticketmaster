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
export const EXPO_PUBLIC_TELEMETRY_ENDPOINT =
    process.env.EXPO_PUBLIC_TELEMETRY_ENDPOINT || '';
export const EXPO_PUBLIC_PRIVACY_POLICY_URL =
    process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL ||
    'https://example.com/privacy-policy';
export const EXPO_PUBLIC_TERMS_URL =
    process.env.EXPO_PUBLIC_TERMS_URL ||
    'https://example.com/terms';
