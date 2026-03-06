"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const frameBus_1 = require("@/core/audio/frameBus");
(0, node_test_1.default)('FrameBus drops oldest frames when queue exceeds maxQueue', () => {
    const bus = new frameBus_1.FrameBus({ maxQueue: 3, maxPerTick: 1 });
    const drained = [];
    // Push 5 items quickly; queue max is 3 so 2 should be dropped.
    for (let i = 0; i < 5; i++) {
        bus.push(i, (x) => drained.push(x));
    }
    const st = bus.getStats();
    strict_1.default.equal(st.maxQueue, 3);
    strict_1.default.equal(st.dropped, 2);
});
