"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canShowPassiveMonetization = canShowPassiveMonetization;
exports.listBlockedPassiveMonetizationSurfaces = listBlockedPassiveMonetizationSurfaces;
const BLOCKED_PASSIVE_MONETIZATION_SURFACES = new Set([
    'Welcome',
    'Onboarding',
    'PermissionsPrimer',
    'WakeYourVoice',
    'FirstWinResult',
    'Drill',
    'DrillResult',
    'Playback',
    'Recovery',
    'RangeSnapshot',
]);
function canShowPassiveMonetization(surface) {
    if (!surface)
        return false;
    return !BLOCKED_PASSIVE_MONETIZATION_SURFACES.has(surface);
}
function listBlockedPassiveMonetizationSurfaces() {
    return Array.from(BLOCKED_PASSIVE_MONETIZATION_SURFACES.values()).sort();
}
