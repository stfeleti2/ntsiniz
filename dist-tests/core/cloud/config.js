"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCloudConfig = getCloudConfig;
exports.isCloudConfigured = isCloudConfigured;
function getConstantsExtra() {
    try {
        // Keep this lazy for node-based core tests.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mod = require('expo-constants');
        const constants = mod?.default ?? mod;
        return constants?.expoConfig?.extra ?? constants?.manifest?.extra ?? {};
    }
    catch {
        return {};
    }
}
function getCloudConfig() {
    const extra = getConstantsExtra();
    return {
        supabaseUrl: (extra?.supabaseUrl ?? '').trim(),
        supabaseAnonKey: (extra?.supabaseAnonKey ?? '').trim(),
        cloudAutoSync: extra?.cloudAutoSync === true,
    };
}
function isCloudConfigured() {
    const c = getCloudConfig();
    return !!c.supabaseUrl && !!c.supabaseAnonKey;
}
