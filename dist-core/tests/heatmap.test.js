"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const heatmap_js_1 = require("../progress/heatmap.js");
(0, node_test_1.default)("computeHeatmapDays returns fixed window with counts", () => {
    const day = 24 * 60 * 60 * 1000;
    const end = Date.UTC(2026, 0, 8, 12, 0, 0);
    const startDay = Date.UTC(2026, 0, 6, 0, 0, 0);
    const aggs = [
        { id: "a", startedAt: startDay + 10_000, endedAt: startDay + 70_000, avgScore: 60, attemptCount: 3 },
        { id: "b", startedAt: startDay + day + 10_000, endedAt: startDay + day + 90_000, avgScore: 70, attemptCount: 3 },
    ];
    const out = (0, heatmap_js_1.computeHeatmapDays)({ aggs: aggs, endMs: end, days: 3 });
    strict_1.default.equal(out.length, 3);
    strict_1.default.equal(out[0].sessions, 1);
    strict_1.default.equal(out[1].sessions, 1);
    strict_1.default.equal(out[2].sessions, 0);
});
