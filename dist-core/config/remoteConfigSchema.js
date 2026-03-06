"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRemoteConfig = validateRemoteConfig;
exports.safeValidateRemoteConfig = safeValidateRemoteConfig;
const errors_1 = require("@/core/util/errors");
function isPlainObject(v) {
    return !!v && typeof v === 'object' && !Array.isArray(v);
}
function coerceBoolRecord(v) {
    if (v == null)
        return undefined;
    if (!isPlainObject(v))
        return undefined;
    const out = {};
    for (const [k, val] of Object.entries(v)) {
        if (typeof val === 'boolean')
            out[k] = val;
    }
    return out;
}
function coerceStringArray(v) {
    if (v == null)
        return undefined;
    if (!Array.isArray(v))
        return undefined;
    const out = v.filter((x) => typeof x === 'string');
    return out;
}
function coerceSemverString(v) {
    if (typeof v !== 'string')
        return undefined;
    const s = v.trim();
    // very small guard; we don't want to reject valid semver-like tags
    if (!s)
        return undefined;
    return s;
}
function coerceNumber(v) {
    if (typeof v !== 'number')
        return undefined;
    if (!Number.isFinite(v))
        return undefined;
    return v;
}
function validateRemoteConfig(input) {
    if (input == null)
        return { ok: true, value: {} };
    if (!isPlainObject(input))
        return { ok: false, reason: 'not_object' };
    const flags = coerceBoolRecord(input.flags);
    const scoring = isPlainObject(input.scoring) ? input.scoring : undefined;
    const packs = isPlainObject(input.packs) ? input.packs : undefined;
    let killSwitch;
    if (input.killSwitch != null) {
        if (!isPlainObject(input.killSwitch))
            return { ok: false, reason: 'killSwitch_not_object' };
        killSwitch = {
            disabledPackIds: coerceStringArray(input.killSwitch.disabledPackIds),
            disabledDrillIds: coerceStringArray(input.killSwitch.disabledDrillIds),
            disabledLessonIds: coerceStringArray(input.killSwitch.disabledLessonIds),
            disabledCompetitionIds: coerceStringArray(input.killSwitch.disabledCompetitionIds),
        };
    }
    let compat;
    if (input.compat != null) {
        if (!isPlainObject(input.compat))
            return { ok: false, reason: 'compat_not_object' };
        compat = {
            minAppVersion: coerceSemverString(input.compat.minAppVersion),
            maxAppVersion: coerceSemverString(input.compat.maxAppVersion),
            minManifestSchema: coerceNumber(input.compat.minManifestSchema),
        };
    }
    let security;
    if (input.security != null) {
        if (!isPlainObject(input.security))
            return { ok: false, reason: 'security_not_object' };
        const req = input.security.requireManifestSignature;
        security = {
            requireManifestSignature: typeof req === 'boolean' ? req : undefined,
        };
    }
    return { ok: true, value: { flags, scoring, packs, killSwitch, compat, security } };
}
function safeValidateRemoteConfig(input) {
    const v = validateRemoteConfig(input);
    if (v.ok)
        return v.value;
    (0, errors_1.coreError)('remote_config_invalid', { reason: v.reason });
    return {};
}
