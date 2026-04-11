"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const root = process.cwd();
function collectFiles(dirPath, extensions) {
    const results = [];
    const stack = [dirPath];
    while (stack.length) {
        const dir = stack.pop();
        if (!dir || !node_fs_1.default.existsSync(dir))
            continue;
        for (const entry of node_fs_1.default.readdirSync(dir, { withFileTypes: true })) {
            const fullPath = node_path_1.default.join(dir, entry.name);
            if (entry.isDirectory()) {
                stack.push(fullPath);
                continue;
            }
            if (entry.isFile() && extensions.some((ext) => fullPath.endsWith(ext))) {
                results.push(fullPath);
            }
        }
    }
    return results;
}
(0, node_test_1.default)('new ui system paths avoid direct legacy ui imports', () => {
    const files = [
        ...collectFiles(node_path_1.default.join(root, 'src/components'), ['.ts', '.tsx']),
        ...collectFiles(node_path_1.default.join(root, 'src/screens/previews'), ['.ts', '.tsx']),
        ...collectFiles(node_path_1.default.join(root, 'src/storybook'), ['.ts', '.tsx']),
    ];
    for (const file of files) {
        const source = node_fs_1.default.readFileSync(file, 'utf8');
        strict_1.default.equal(source.includes('@/ui/'), false, `legacy import found in ${file}`);
    }
});
(0, node_test_1.default)('storybook config remains dev-only behind env flags', () => {
    const appFile = node_fs_1.default.readFileSync(node_path_1.default.join(root, 'App.tsx'), 'utf8');
    const metroFile = node_fs_1.default.readFileSync(node_path_1.default.join(root, 'metro.config.js'), 'utf8');
    strict_1.default.equal(appFile.includes('EXPO_PUBLIC_STORYBOOK_ENABLED'), true);
    strict_1.default.equal(appFile.includes('EXPO_PUBLIC_STORYBOOK_ROOT'), true);
    strict_1.default.equal(metroFile.includes('EXPO_PUBLIC_STORYBOOK_ENABLED'), true);
});
