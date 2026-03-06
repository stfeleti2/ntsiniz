"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatNumber = formatNumber;
exports.formatDate = formatDate;
exports.plural = plural;
const runtime_1 = require("./runtime");
function formatNumber(value, opts) {
    const loc = (0, runtime_1.getLocale)();
    try {
        return new Intl.NumberFormat(loc, opts).format(value);
    }
    catch {
        return String(value);
    }
}
function formatDate(value, opts) {
    const loc = (0, runtime_1.getLocale)();
    const d = typeof value === 'number' ? new Date(value) : value;
    try {
        return new Intl.DateTimeFormat(loc, opts).format(d);
    }
    catch {
        return d.toISOString();
    }
}
/**
 * Plural-aware lookup.
 * Convention supported:
 * - nested: key.one, key.other
 * - flat: key_one, key_other
 */
function plural(path, count, vars) {
    const loc = (0, runtime_1.getLocale)();
    let rule = 'other';
    try {
        rule = new Intl.PluralRules(loc).select(count);
    }
    catch {
        rule = count === 1 ? 'one' : 'other';
    }
    const nested = `${path}.${rule}`;
    const flat = `${path}_${rule}`;
    const outNested = (0, runtime_1.t)(nested, { ...(vars ?? {}), count });
    if (outNested !== nested)
        return outNested;
    const outFlat = (0, runtime_1.t)(flat, { ...(vars ?? {}), count });
    if (outFlat !== flat)
        return outFlat;
    // fallback
    return (0, runtime_1.t)(path, { ...(vars ?? {}), count });
}
