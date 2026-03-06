"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enqueueUpsert = enqueueUpsert;
exports.enqueueHide = enqueueHide;
exports.enqueueDelete = enqueueDelete;
const syncQueueRepo_1 = require("./syncQueueRepo");
const logger_1 = require("@/core/observability/logger");
// We enqueue changes even when cloud isn't configured yet.
// This keeps the app "sync-ready" if the user later turns on cloud.
async function enqueueUpsert(kind, entityId, payload, updatedAt) {
    await (0, syncQueueRepo_1.enqueueSyncOp)({ kind, entityId, action: 'upsert', payload, updatedAt }).catch((e) => logger_1.logger.warn('suppressed error', e));
}
async function enqueueHide(kind, entityId, payload, updatedAt) {
    await (0, syncQueueRepo_1.enqueueSyncOp)({ kind, entityId, action: 'hide', payload, updatedAt }).catch((e) => logger_1.logger.warn('suppressed error', e));
}
async function enqueueDelete(kind, entityId, payload, updatedAt) {
    await (0, syncQueueRepo_1.enqueueSyncOp)({ kind, entityId, action: 'delete', payload, updatedAt }).catch((e) => logger_1.logger.warn('suppressed error', e));
}
