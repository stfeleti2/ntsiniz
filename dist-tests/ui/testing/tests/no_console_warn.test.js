"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
(0, node_test_1.default)('no console.warn in app screens (use reportUiError)', () => {
    const repoRoot = node_path_1.default.resolve(process.cwd());
    const screensDir = node_path_1.default.join(repoRoot, 'src', 'app', 'screens');
    const files = node_fs_1.default.readdirSync(screensDir).filter((f) => f.endsWith('.tsx'));
    const offenders = [];
    for (const f of files) {
        const src = node_fs_1.default.readFileSync(node_path_1.default.join(screensDir, f), 'utf8');
        if (src.includes('console.warn'))
            offenders.push(f);
    }
    strict_1.default.equal(offenders.length, 0, `Found console.warn in: ${offenders.join(', ')}`);
});
