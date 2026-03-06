"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const config_js_1 = require("../cloud/config.js");
(0, node_test_1.default)('getCloudConfig: cloudAutoSync defaults to false unless explicitly enabled', () => {
    const real = globalThis.expo;
    // config.ts reads from expo-constants; in node tests we can only assert the logic by
    // verifying the default branch when extra is missing.
    // If this test fails in CI due to expo-constants behavior, switch to an injected config shim.
    const c = (0, config_js_1.getCloudConfig)();
    strict_1.default.equal(c.cloudAutoSync, false);
    globalThis.expo = real;
});
