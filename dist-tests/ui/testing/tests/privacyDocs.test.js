"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
(0, node_test_1.default)('privacy docs contain no TODO/TBD/FIXME markers', () => {
    const root = process.cwd();
    const p = node_path_1.default.join(root, 'docs', 'privacy', 'DATA_MAP.md');
    const src = node_fs_1.default.readFileSync(p, 'utf8');
    strict_1.default.ok(!/\b(TODO|TBD|FIXME)\b/i.test(src), 'DATA_MAP.md still contains TODO/TBD/FIXME markers');
});
