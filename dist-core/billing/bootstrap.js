"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startBillingBootstrap = startBillingBootstrap;
const react_native_1 = require("react-native");
const errors_1 = require("@/core/util/errors");
const revenuecat_1 = require("./revenuecat");
/**
 * BillingBootstrap
 *
 * Goal: keep entitlements fresh without forcing a restart.
 * - refresh on app foreground
 * - exponential backoff on failures
 */
function startBillingBootstrap() {
    if (!(0, revenuecat_1.isRevenueCatConfigured)())
        return () => { };
    let stopped = false;
    let retry = 0;
    let timer = null;
    const schedule = () => {
        if (stopped)
            return;
        const ms = Math.min(60_000, 2_000 * Math.pow(2, retry));
        clearTimeout(timer);
        timer = setTimeout(() => {
            void refresh('timer');
        }, ms);
    };
    const refresh = async (source) => {
        if (stopped)
            return;
        const info = await (0, revenuecat_1.refreshCustomerInfoSafe)().catch((e) => {
            (0, errors_1.coreError)('billing_refresh_failed', { source, e });
            return null;
        });
        if (info) {
            retry = 0;
            return;
        }
        retry = Math.min(6, retry + 1);
        schedule();
    };
    // Prime once.
    void refresh('timer');
    const sub = react_native_1.AppState.addEventListener('change', (s) => {
        if (s === 'active')
            void refresh('foreground');
    });
    return () => {
        stopped = true;
        clearTimeout(timer);
        sub?.remove?.();
    };
}
