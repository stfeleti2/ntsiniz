"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const manifest_js_1 = require("../content/manifest.js");
(0, node_test_1.default)('content manifest entries match stable hash of bundled JSON', () => {
    const manifestPath = node_path_1.default.resolve(process.cwd(), 'src/content/manifests/content.manifest.json');
    const m = JSON.parse(node_fs_1.default.readFileSync(manifestPath, 'utf8'));
    strict_1.default.ok(m.schema >= 2);
    for (const e of m.entries) {
        const abs = node_path_1.default.resolve(process.cwd(), 'src/content', e.file);
        const obj = JSON.parse(node_fs_1.default.readFileSync(abs, 'utf8'));
        const h = (0, manifest_js_1.computeEntryHashFromObject)(obj);
        strict_1.default.equal(h, e.sha256, `hash mismatch for ${e.file}`);
    }
});
