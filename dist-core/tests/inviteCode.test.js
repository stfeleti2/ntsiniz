"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const inviteCode_js_1 = require("../util/inviteCode.js");
(0, node_test_1.default)('invite codes round-trip and validate checksum', () => {
    const userId = 'user_01HXY9KZ2ZQ8W3R9S5T6U7V8W9';
    const code = (0, inviteCode_js_1.makeInviteCode)(userId);
    const parsed = (0, inviteCode_js_1.parseInviteCode)(code);
    strict_1.default.ok(parsed, 'expected parse to succeed');
    strict_1.default.equal(parsed.userId, userId);
    // corruption should fail
    const bad = code.replace(/.$/, (ch) => (ch === 'A' ? 'B' : 'A'));
    strict_1.default.equal((0, inviteCode_js_1.parseInviteCode)(bad), null);
});
