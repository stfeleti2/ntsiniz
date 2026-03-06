"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocale = getLocale;
exports.setLocale = setLocale;
exports.setMissingKeySink = setMissingKeySink;
exports.t = t;
const en_1 = require("./en");
const zu_1 = require("./zu");
const xh_1 = require("./xh");
let missingKeySink = null;
let locale = 'en';
let dict = en_1.en;
function deepMerge(base, override) {
    const out = Array.isArray(base) ? [...base] : { ...base };
    for (const k of Object.keys(override)) {
        const bv = base[k];
        const ov = override[k];
        if (bv && typeof bv === 'object' && !Array.isArray(bv) && ov && typeof ov === 'object' && !Array.isArray(ov)) {
            out[k] = deepMerge(bv, ov);
        }
        else {
            out[k] = ov;
        }
    }
    return out;
}
function getLocale() {
    return locale;
}
function setLocale(next) {
    locale = next || 'en';
    if (locale.startsWith('zu'))
        dict = deepMerge(en_1.en, zu_1.zu);
    else if (locale.startsWith('xh'))
        dict = deepMerge(en_1.en, xh_1.xh);
    else
        dict = en_1.en;
}
/**
 * Optional production-safe hook: apps can wire this to telemetry.
 * Must remain non-PII (only key + locale).
 */
function setMissingKeySink(fn) {
    missingKeySink = fn;
}
function t(path, varsOrFallback, maybeVars) {
    const parts = path.split('.');
    let cur = dict;
    for (const p of parts) {
        cur = cur?.[p];
    }
    const hit = typeof cur === 'string';
    if (!hit) {
        try {
            missingKeySink?.({ key: path, locale, at: Date.now() });
        }
        catch {
            // ignore
        }
    }
    const fallback = typeof varsOrFallback === 'string' ? varsOrFallback : undefined;
    const vars = typeof varsOrFallback === 'string' ? maybeVars : varsOrFallback;
    const base = hit ? cur : fallback ?? path;
    if (!vars)
        return base;
    return base.replace(/\{(\w+)\}/g, (_m, key) => {
        const v = vars[key];
        return v == null ? `{${key}}` : String(v);
    });
}
