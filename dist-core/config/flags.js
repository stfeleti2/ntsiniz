"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.primeRemoteFlags = primeRemoteFlags;
exports.isPackDisabled = isPackDisabled;
exports.isDrillDisabled = isDrillDisabled;
exports.isLessonDisabled = isLessonDisabled;
exports.isCompetitionDisabled = isCompetitionDisabled;
exports.getDisabledPackIds = getDisabledPackIds;
exports.getDisabledDrillIds = getDisabledDrillIds;
exports.getDisabledLessonIds = getDisabledLessonIds;
exports.getDisabledCompetitionIds = getDisabledCompetitionIds;
exports.requireManifestSignature = requireManifestSignature;
exports.minManifestSchema = minManifestSchema;
exports.minAppVersion = minAppVersion;
exports.maxAppVersion = maxAppVersion;
exports.isStoreBuild = isStoreBuild;
exports.useSkiaOverlays = useSkiaOverlays;
exports.isLowEndMode = isLowEndMode;
exports.enableCloud = enableCloud;
exports.enableSocial = enableSocial;
exports.enableInvites = enableInvites;
exports.enableDuets = enableDuets;
exports.enableCompetitions = enableCompetitions;
exports.enableMarketplace = enableMarketplace;
exports.enableDiagnostics = enableDiagnostics;
const expo_constants_1 = __importDefault(require("expo-constants"));
const remoteConfig_1 = require("./remoteConfig");
let remoteFlagsCache = null;
let disabledPackIdsCache = null;
let disabledDrillIdsCache = null;
let disabledLessonIdsCache = null;
let disabledCompetitionIdsCache = null;
let requireManifestSignatureCache = null;
let minManifestSchemaCache = null;
let minAppVersionCache = null;
let maxAppVersionCache = null;
async function primeRemoteFlags() {
    const rc = await (0, remoteConfig_1.getRemoteConfig)();
    remoteFlagsCache = (rc.flags ?? null);
    const disabled = rc.killSwitch?.disabledPackIds ?? [];
    disabledPackIdsCache = new Set(disabled);
    const disabledDrills = rc.killSwitch?.disabledDrillIds ?? [];
    disabledDrillIdsCache = new Set(disabledDrills);
    const disabledLessons = rc.killSwitch?.disabledLessonIds ?? [];
    disabledLessonIdsCache = new Set(disabledLessons);
    const disabledComps = rc.killSwitch?.disabledCompetitionIds ?? [];
    disabledCompetitionIdsCache = new Set(disabledComps);
    requireManifestSignatureCache = rc.security?.requireManifestSignature ?? null;
    minManifestSchemaCache = (typeof rc.compat?.minManifestSchema === 'number' ? rc.compat?.minManifestSchema : null);
    minAppVersionCache = (typeof rc.compat?.minAppVersion === 'string' ? rc.compat?.minAppVersion : null);
    maxAppVersionCache = (typeof rc.compat?.maxAppVersion === 'string' ? rc.compat?.maxAppVersion : null);
}
function remoteFlag(key) {
    return remoteFlagsCache ? remoteFlagsCache[key] : undefined;
}
function isPackDisabled(packId) {
    return !!disabledPackIdsCache?.has(packId);
}
function isDrillDisabled(drillId) {
    return !!disabledDrillIdsCache?.has(drillId);
}
function isLessonDisabled(lessonId) {
    return !!disabledLessonIdsCache?.has(lessonId);
}
function isCompetitionDisabled(competitionId) {
    return !!disabledCompetitionIdsCache?.has(competitionId);
}
function getDisabledPackIds() {
    return disabledPackIdsCache ? Array.from(disabledPackIdsCache) : [];
}
function getDisabledDrillIds() {
    return disabledDrillIdsCache ? Array.from(disabledDrillIdsCache) : [];
}
function getDisabledLessonIds() {
    return disabledLessonIdsCache ? Array.from(disabledLessonIdsCache) : [];
}
function getDisabledCompetitionIds() {
    return disabledCompetitionIdsCache ? Array.from(disabledCompetitionIdsCache) : [];
}
function requireManifestSignature() {
    // Security-ish policy:
    // - In production store builds, signature verification is ALWAYS required.
    // - Remote config may only tighten (turn ON), never loosen.
    const base = !__DEV__ && isStoreBuild();
    if (base)
        return true;
    if (requireManifestSignatureCache === true)
        return true;
    if (requireManifestSignatureCache === false)
        return false;
    // Non-store builds default to OFF unless explicitly enabled.
    return false;
}
function minManifestSchema() {
    const base = null;
    const rc = minManifestSchemaCache;
    if (typeof rc === 'number')
        return base == null ? rc : Math.max(base, rc);
    return base;
}
function minAppVersion() {
    return minAppVersionCache;
}
function maxAppVersion() {
    return maxAppVersionCache;
}
function getExtra() {
    const cfg = expo_constants_1.default.expoConfig ?? expo_constants_1.default.manifest ?? expo_constants_1.default.manifest2;
    return (cfg?.extra ?? {});
}
function toCamel(s) {
    return s
        .toLowerCase()
        .split('_')
        .map((p, i) => (i === 0 ? p : p.slice(0, 1).toUpperCase() + p.slice(1)))
        .join('');
}
function getBoolean(name, opts) {
    const env = (process.env[name] ?? '').toLowerCase();
    if (env === 'true')
        return true;
    if (env === 'false')
        return false;
    const extra = getExtra();
    const v = String(extra[name] ?? extra[toCamel(name)] ?? '').toLowerCase();
    if (v === 'true')
        return true;
    if (v === 'false')
        return false;
    return opts?.default ?? false;
}
/**
 * Store-build surface flag.
 * - When true, only ship the core Phase 1 surfaces (no unfinished tabs/screens).
 * - Configure via EAS env or app.config.ts extra: STORE_BUILD=true.
 */
function isStoreBuild() {
    // Prefer explicit env in native builds; fall back to expo extra.
    const env = (process.env.STORE_BUILD ?? '').toLowerCase();
    if (env === 'true')
        return true;
    if (env === 'false')
        return false;
    const extra = getExtra();
    const v = String(extra.storeBuild ?? '').toLowerCase();
    return v === 'true';
}
/**
 * Enable Skia rendering for gameplay overlays (Ghost Guide / Waveforms).
 *
 * Defaults:
 * - Enabled in dev (so we can profile).
 * - Disabled in production unless explicitly enabled via env/extra.
 */
function useSkiaOverlays() {
    const env = (process.env.USE_SKIA_OVERLAY ?? '').toLowerCase();
    if (env === 'true')
        return true;
    if (env === 'false')
        return false;
    const extra = getExtra();
    const v = String(extra.useSkiaOverlay ?? '').toLowerCase();
    if (v === 'true')
        return true;
    if (v === 'false')
        return false;
    return !!__DEV__;
}
/**
 * Low-end mode disables expensive visuals that can cause frame drops.
 */
function isLowEndMode() {
    const env = (process.env.LOW_END_MODE ?? '').toLowerCase();
    if (env === 'true')
        return true;
    if (env === 'false')
        return false;
    const extra = getExtra();
    const v = String(extra.lowEndMode ?? '').toLowerCase();
    return v === 'true';
}
/**
 * Feature kill-switches.
 *
 * Defaults:
 * - Store builds: OFF (ship Phase 1 only).
 * - Non-store builds: ON for internal dogfooding, unless explicitly disabled.
 */
function enableCloud() {
    const o = remoteFlag('cloud');
    if (o != null)
        return o;
    return getBoolean('ENABLE_CLOUD', { default: !isStoreBuild() });
}
function enableSocial() {
    const o = remoteFlag('social');
    if (o != null)
        return o;
    return getBoolean('ENABLE_SOCIAL', { default: !isStoreBuild() });
}
function enableInvites() {
    return getBoolean('ENABLE_INVITES', { default: !isStoreBuild() });
}
function enableDuets() {
    const o = remoteFlag('duets');
    if (o != null)
        return o;
    return getBoolean('ENABLE_DUETS', { default: !isStoreBuild() });
}
function enableCompetitions() {
    const o = remoteFlag('competitions');
    if (o != null)
        return o;
    return getBoolean('ENABLE_COMPETITIONS', { default: !isStoreBuild() });
}
function enableMarketplace() {
    const o = remoteFlag('marketplace');
    if (o != null)
        return o;
    return getBoolean('ENABLE_MARKETPLACE', { default: !isStoreBuild() });
}
/**
 * QA-only diagnostics surface.
 * OFF by default in store builds.
 */
function enableDiagnostics() {
    return getBoolean('ENABLE_DIAGNOSTICS', { default: __DEV__ });
}
