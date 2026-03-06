"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
function listFiles(dir) {
    const out = [];
    for (const ent of node_fs_1.default.readdirSync(dir, { withFileTypes: true })) {
        const p = node_path_1.default.join(dir, ent.name);
        if (ent.isDirectory())
            out.push(...listFiles(p));
        else if (ent.isFile() && /\.(ts|tsx)$/.test(ent.name))
            out.push(p);
    }
    return out;
}
(0, node_test_1.default)('no TODO/TBD/FIXME markers in app screens', () => {
    const screensDir = node_path_1.default.join(process.cwd(), 'src', 'app', 'screens');
    const files = listFiles(screensDir);
    strict_1.default.ok(files.length > 0, 'expected screens to exist');
    for (const f of files) {
        const src = node_fs_1.default.readFileSync(f, 'utf8');
        strict_1.default.ok(!/\b(TODO|TBD|FIXME)\b/i.test(src), `marker found in ${node_path_1.default.relative(process.cwd(), f)}`);
    }
});
