"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSessionMeta = setSessionMeta;
exports.getSessionMeta = getSessionMeta;
exports.clearSessionMeta = clearSessionMeta;
const meta = new Map();
function setSessionMeta(sessionId, m) {
    meta.set(sessionId, m);
}
function getSessionMeta(sessionId) {
    return meta.get(sessionId) ?? null;
}
function clearSessionMeta(sessionId) {
    meta.delete(sessionId);
}
