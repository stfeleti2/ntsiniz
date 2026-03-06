"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initBilling = initBilling;
const revenuecat_1 = require("./revenuecat");
async function initBilling() {
    // Safe no-op if keys not configured.
    await (0, revenuecat_1.initRevenueCat)().catch(() => ({ enabled: false }));
}
