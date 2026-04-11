"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const frameBus_1 = require("../audio/frameBus");
(0, node_test_1.default)('FrameBus drops oldest when maxQueue exceeded', async () => {
    const bus = new frameBus_1.FrameBus({ maxQueue: 5, maxPerTick: 10, preferAnimationFrame: false });
    const drained = [];
    for (let i = 0; i < 20; i++) {
        bus.push(i, (v) => drained.push(v));
    }
    // Give scheduler time to drain.
    await new Promise((r) => setTimeout(r, 10));
    const st = bus.getStats();
    // Queue should be empty after drain.
    strict_1.default.equal(st.queue, 0);
    // We expect drops under heavy pressure.
    strict_1.default.ok(st.dropped > 0);
    // Because we drop oldest, drained values should skew toward later items.
    strict_1.default.ok(drained.includes(19));
    strict_1.default.ok(!drained.includes(0) || st.dropped >= 1);
});
(0, node_test_1.default)('FrameBus stop clears queue and prevents further drains', async () => {
    const bus = new frameBus_1.FrameBus({ maxQueue: 5, maxPerTick: 1, preferAnimationFrame: false });
    const drained = [];
    bus.push(1, (v) => drained.push(v));
    bus.stop();
    bus.push(2, (v) => drained.push(v));
    await new Promise((r) => setTimeout(r, 10));
    strict_1.default.deepEqual(drained, []);
});
