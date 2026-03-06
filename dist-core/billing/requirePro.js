"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePro = requirePro;
const entitlementsRepo_1 = require("./entitlementsRepo");
/**
 * Standard premium gate.
 * - If user is Pro, runs onSuccess.
 * - Otherwise navigates to Paywall with a contextual reason.
 */
async function requirePro({ navigation, reason, onSuccess }) {
    const pro = await (0, entitlementsRepo_1.hasPro)().catch(() => false);
    if (pro) {
        onSuccess();
        return;
    }
    navigation.navigate('Paywall', { reason });
}
