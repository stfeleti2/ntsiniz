"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const node_assert_1 = __importDefault(require("node:assert"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
function readAllText(dir) {
    const out = [];
    for (const entry of node_fs_1.default.readdirSync(dir, { withFileTypes: true })) {
        const p = node_path_1.default.join(dir, entry.name);
        if (entry.isDirectory())
            out.push(readAllText(p));
        else if (entry.isFile())
            out.push(node_fs_1.default.readFileSync(p, 'utf8'));
    }
    return out.join('\n');
}
(0, node_test_1.default)('legal docs/text contain no placeholder markers', () => {
    const repoRoot = node_path_1.default.resolve(process.cwd());
    const legalDocs = node_path_1.default.join(repoRoot, 'docs', 'legal');
    const legalText = node_path_1.default.join(repoRoot, 'src', 'app', 'legal');
    const src = readAllText(legalDocs) + '\n' + readAllText(legalText);
    node_assert_1.default.ok(!/\b(TODO|TBD|FIXME)\b/i.test(src), 'Legal docs/text still contain TODO/TBD/FIXME markers');
});
