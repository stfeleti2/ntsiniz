"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const version_js_1 = require("../util/version.js");
(0, node_test_1.default)('compareVersions orders semver-ish versions', () => {
    strict_1.default.equal((0, version_js_1.compareVersions)('1.2.3', '1.2.3'), 0);
    strict_1.default.equal((0, version_js_1.compareVersions)('1.2.3', '1.2.4'), -1);
    strict_1.default.equal((0, version_js_1.compareVersions)('1.2.10', '1.2.4'), 1);
    strict_1.default.equal((0, version_js_1.compareVersions)('1.2.3-beta', '1.2.3'), 0);
});
(0, node_test_1.default)('isVersionInRange respects min/max', () => {
    strict_1.default.equal((0, version_js_1.isVersionInRange)({ version: '1.0.0', min: '0.9.0', max: '1.0.0' }), true);
    strict_1.default.equal((0, version_js_1.isVersionInRange)({ version: '0.8.9', min: '0.9.0', max: '1.0.0' }), false);
    strict_1.default.equal((0, version_js_1.isVersionInRange)({ version: '1.0.1', min: '0.9.0', max: '1.0.0' }), false);
});
