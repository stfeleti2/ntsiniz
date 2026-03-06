"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribeEntitlements = subscribeEntitlements;
exports.getEntitlements = getEntitlements;
exports.upsertEntitlements = upsertEntitlements;
exports.setEntitlements = setEntitlements;
exports.setProEnabled = setProEnabled;
exports.hasPro = hasPro;
exports.setEntitlementsFromRevenueCat = setEntitlementsFromRevenueCat;
const db_1 = require("@/core/storage/db");
const DEFAULT_ENTITLEMENTS = { pro: false, proUntilMs: null, source: 'local', syncedAtMs: null };
const listeners = new Set();
function subscribeEntitlements(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
}
function notify(e) {
    for (const fn of listeners) {
        try {
            fn(e);
        }
        catch {
            // ignore
        }
    }
}
function safeParseMerge(v, fallback) {
    try {
        const obj = typeof v === 'string' ? JSON.parse(v) : v;
        if (!obj || typeof obj !== 'object')
            return fallback;
        return { ...fallback, ...obj };
    }
    catch {
        return fallback;
    }
}
async function getEntitlements() {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM entitlements WHERE id = 'default' LIMIT 1;`);
    if (!rows[0])
        return DEFAULT_ENTITLEMENTS;
    return safeParseMerge(rows[0].data, DEFAULT_ENTITLEMENTS);
}
async function upsertEntitlements(e) {
    const d = await (0, db_1.getDb)();
    await (0, db_1.exec)(d, `INSERT INTO entitlements (id, data) VALUES ('default', ?)
     ON CONFLICT(id) DO UPDATE SET data = excluded.data;`, [JSON.stringify(e)]);
}
/**
 * Replace entitlements atomically.
 * Prefer this over calling upsertEntitlements directly so we can enforce invariants.
 */
async function setEntitlements(e) {
    // Normalize: if pro is false, ignore proUntil.
    const normalized = {
        ...DEFAULT_ENTITLEMENTS,
        ...e,
    };
    if (!normalized.pro)
        normalized.proUntilMs = null;
    await upsertEntitlements(normalized);
    notify(normalized);
}
async function setProEnabled(enabled) {
    const e = await getEntitlements();
    e.pro = !!enabled;
    e.proUntilMs = null;
    await setEntitlements(e);
}
async function hasPro() {
    const e = await getEntitlements();
    if (e.proUntilMs && Date.now() > e.proUntilMs)
        return false;
    return !!e.pro;
}
async function setEntitlementsFromRevenueCat(info, entitlementId) {
    const ent = info?.entitlements?.active?.[entitlementId];
    const pro = Boolean(ent);
    const until = ent?.expiresDate ? new Date(ent.expiresDate).getTime() : null;
    await setEntitlements({ pro, proUntilMs: until, source: 'revenuecat', syncedAtMs: Date.now() });
}
