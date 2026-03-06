"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const permissionGate_1 = require("../audio/permissionGate");
(0, node_test_1.default)("ensurePermissionOnce: caches granted state", async () => {
    (0, permissionGate_1.resetPermissionGate)();
    let calls = 0;
    const ensure = async () => {
        calls += 1;
        return true;
    };
    const a = await (0, permissionGate_1.ensurePermissionOnce)(ensure);
    const b = await (0, permissionGate_1.ensurePermissionOnce)(ensure);
    strict_1.default.equal(a, true);
    strict_1.default.equal(b, true);
    strict_1.default.equal(calls, 1);
});
(0, node_test_1.default)("ensurePermissionOnce: does not cache denial", async () => {
    (0, permissionGate_1.resetPermissionGate)();
    let calls = 0;
    const ensure = async () => {
        calls += 1;
        return calls >= 2;
    };
    const a = await (0, permissionGate_1.ensurePermissionOnce)(ensure); // false
    const b = await (0, permissionGate_1.ensurePermissionOnce)(ensure); // true
    strict_1.default.equal(a, false);
    strict_1.default.equal(b, true);
    strict_1.default.equal(calls, 2);
});
