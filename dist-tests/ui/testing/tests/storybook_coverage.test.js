"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const storiesRoot = node_path_1.default.resolve(process.cwd(), 'src/storybook/stories');
function walkFiles(root) {
    const out = [];
    const stack = [root];
    while (stack.length) {
        const dir = stack.pop();
        if (!dir)
            continue;
        for (const entry of node_fs_1.default.readdirSync(dir, { withFileTypes: true })) {
            const full = node_path_1.default.join(dir, entry.name);
            if (entry.isDirectory())
                stack.push(full);
            if (entry.isFile())
                out.push(full);
        }
    }
    return out;
}
(0, node_test_1.default)('storybook stories follow naming taxonomy', () => {
    const files = walkFiles(storiesRoot).map((f) => f.split(node_path_1.default.sep).join('/'));
    strict_1.default.equal(files.length > 0, true);
    for (const file of files) {
        strict_1.default.equal(/\.(atom|molecule|organism|screen)\.stories\.tsx$/.test(file), true, `invalid story name: ${file}`);
    }
});
(0, node_test_1.default)('required full-screen stories exist', () => {
    const required = [
        'Welcome.screen.stories.tsx',
        'SingingLevelSelection.screen.stories.tsx',
        'MicPermission.screen.stories.tsx',
        'RangeFinder.screen.stories.tsx',
        'Drill.screen.stories.tsx',
        'Playback.screen.stories.tsx',
        'SessionSummary.screen.stories.tsx',
    ];
    const files = new Set(walkFiles(node_path_1.default.join(storiesRoot, 'screens')).map((f) => node_path_1.default.basename(f)));
    for (const expected of required) {
        strict_1.default.equal(files.has(expected), true, `missing required screen story: ${expected}`);
    }
});
