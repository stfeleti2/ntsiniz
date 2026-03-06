"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRevenueCatConfig = getRevenueCatConfig;
exports.isRevenueCatConfigured = isRevenueCatConfigured;
exports.initRevenueCat = initRevenueCat;
exports.getOfferingsSafe = getOfferingsSafe;
exports.purchasePackageSafe = purchasePackageSafe;
exports.restorePurchasesSafe = restorePurchasesSafe;
exports.refreshCustomerInfoSafe = refreshCustomerInfoSafe;
exports.openManageSubscriptions = openManageSubscriptions;
const react_native_1 = require("react-native");
const expo_constants_1 = __importDefault(require("expo-constants"));
const react_native_purchases_1 = __importStar(require("react-native-purchases"));
const entitlementsRepo_1 = require("./entitlementsRepo");
const logger_1 = require("@/core/observability/logger");
function getExtra() {
    const cfg = expo_constants_1.default.expoConfig ?? expo_constants_1.default.manifest ?? expo_constants_1.default.manifest2;
    return (cfg?.extra ?? {});
}
function getRevenueCatConfig() {
    const extra = getExtra();
    return {
        iosApiKey: String(extra.revenuecatIosApiKey ?? ''),
        androidApiKey: String(extra.revenuecatAndroidApiKey ?? ''),
        entitlementPro: String(extra.revenuecatEntitlementPro ?? 'pro'),
    };
}
function isRevenueCatConfigured() {
    const c = getRevenueCatConfig();
    if (react_native_1.Platform.OS === 'ios')
        return Boolean(c.iosApiKey);
    if (react_native_1.Platform.OS === 'android')
        return Boolean(c.androidApiKey);
    // Web: leave optional — RevenueCat added RN-web support recently, but many teams gate this later.
    return false;
}
let configured = false;
let entitlementId = 'pro';
async function initRevenueCat() {
    if (configured)
        return { enabled: true };
    const cfg = getRevenueCatConfig();
    entitlementId = cfg.entitlementPro || 'pro';
    const apiKey = react_native_1.Platform.OS === 'ios' ? cfg.iosApiKey :
        react_native_1.Platform.OS === 'android' ? cfg.androidApiKey :
            '';
    if (!apiKey)
        return { enabled: false };
    // In production you typically keep this at WARN.
    // In dev, DEBUG can help diagnose StoreKit/Play Billing issues.
    react_native_purchases_1.default.setLogLevel(__DEV__ ? react_native_purchases_1.LOG_LEVEL.DEBUG : react_native_purchases_1.LOG_LEVEL.WARN);
    react_native_purchases_1.default.configure({ apiKey });
    // Keep local entitlements in sync with RevenueCat.
    react_native_purchases_1.default.addCustomerInfoUpdateListener((info) => {
        (0, entitlementsRepo_1.setEntitlementsFromRevenueCat)(info, entitlementId).catch((e) => (0, logger_1.coreError)('revenuecat_entitlements_sync_failed', { e }));
    });
    const info = await react_native_purchases_1.default.getCustomerInfo().catch(() => null);
    if (info)
        await (0, entitlementsRepo_1.setEntitlementsFromRevenueCat)(info, entitlementId).catch((e) => (0, logger_1.coreError)('revenuecat_entitlements_sync_failed', { e }));
    configured = true;
    return { enabled: true };
}
async function getOfferingsSafe() {
    if (!configured) {
        const init = await initRevenueCat();
        if (!init.enabled)
            return { current: null, all: null };
    }
    const offerings = await react_native_purchases_1.default.getOfferings();
    return { current: offerings.current, all: offerings.all };
}
async function purchasePackageSafe(pkg) {
    if (!configured) {
        const init = await initRevenueCat();
        if (!init.enabled)
            return null;
    }
    const result = await react_native_purchases_1.default.purchasePackage(pkg);
    return result.customerInfo ?? null;
}
async function restorePurchasesSafe() {
    if (!configured) {
        const init = await initRevenueCat();
        if (!init.enabled)
            return null;
    }
    const info = await react_native_purchases_1.default.restorePurchases();
    return info ?? null;
}
/**
 * Force-refresh CustomerInfo and sync local entitlements.
 * Useful for paywall/billing entry and to avoid "I paid but still locked" scenarios.
 */
async function refreshCustomerInfoSafe(entitlementOverride) {
    if (!configured) {
        const init = await initRevenueCat();
        if (!init.enabled)
            return null;
    }
    const info = await react_native_purchases_1.default.getCustomerInfo().catch(() => null);
    if (info)
        await (0, entitlementsRepo_1.setEntitlementsFromRevenueCat)(info, entitlementOverride ?? entitlementId).catch((e) => (0, logger_1.coreError)('revenuecat_entitlements_refresh_sync_failed', { e }));
    return info;
}
async function openManageSubscriptions() {
    if (react_native_1.Platform.OS === 'ios') {
        // iOS has native UI for subscription management.
        await react_native_purchases_1.default.showManageSubscriptions();
        return;
    }
    if (react_native_1.Platform.OS === 'android') {
        // On Android, RevenueCat exposes helpers too.
        await react_native_purchases_1.default.showManageSubscriptions();
        return;
    }
}
