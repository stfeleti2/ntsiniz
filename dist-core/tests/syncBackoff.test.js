"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const syncQueueRepo_1 = require("../cloud/syncQueueRepo");
(0, node_test_1.default)('computeBackoffMs: increases and caps', () => {
    const a = (0, syncQueueRepo_1.computeBackoffMs)(0);
    const b = (0, syncQueueRepo_1.computeBackoffMs)(1);
    const c = (0, syncQueueRepo_1.computeBackoffMs)(5);
    const d = (0, syncQueueRepo_1.computeBackoffMs)(20);
    strict_1.default.ok(a >= 1000);
    strict_1.default.ok(b >= a);
    strict_1.default.ok(c >= b);
    // cap ~10 minutes + jitter
    strict_1.default.ok(d <= 10 * 60_000 + 500);
});
(0, node_test_1.default)('MAX_SYNC_TRIES: reasonable', () => {
    strict_1.default.ok(syncQueueRepo_1.MAX_SYNC_TRIES >= 5);
    strict_1.default.ok(syncQueueRepo_1.MAX_SYNC_TRIES <= 12);
});
