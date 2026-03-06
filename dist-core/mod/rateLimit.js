"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allowAction = allowAction;
const buckets = new Map();
/**
 * Very small in-memory rate limit for local safety actions.
 * Not meant for abuse prevention at internet scale.
 */
function allowAction(key, limit, windowMs) {
    const now = Date.now();
    const arr = buckets.get(key) ?? [];
    const fresh = arr.filter((t) => now - t < windowMs);
    if (fresh.length >= limit) {
        buckets.set(key, fresh);
        return false;
    }
    fresh.push(now);
    buckets.set(key, fresh);
    return true;
}
