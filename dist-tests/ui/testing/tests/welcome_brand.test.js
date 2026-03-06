"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const i18n_1 = require("@/core/i18n");
(0, node_test_1.default)('brand name translation is stable', () => {
    (0, i18n_1.setLocale)('en');
    strict_1.default.equal((0, i18n_1.t)('brand.name'), 'Ntsiniz');
});
