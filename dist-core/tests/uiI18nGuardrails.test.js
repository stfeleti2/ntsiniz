"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const en_js_1 = require("../i18n/en.js");
const ROOT = process.cwd();
const SOURCE_DIRS = ['src/app', 'src/ui', 'src/core'];
const IGNORE_DIR_NAMES = new Set(['node_modules', 'dist-core', 'dist-tests', 'android', 'ios', '.git', '.expo']);
function walkFiles(dirAbs, files = []) {
    if (!node_fs_1.default.existsSync(dirAbs))
        return files;
    for (const ent of node_fs_1.default.readdirSync(dirAbs, { withFileTypes: true })) {
        const abs = node_path_1.default.join(dirAbs, ent.name);
        if (ent.isDirectory()) {
            if (IGNORE_DIR_NAMES.has(ent.name))
                continue;
            walkFiles(abs, files);
            continue;
        }
        files.push(abs);
    }
    return files;
}
function sourceFiles(ext) {
    return SOURCE_DIRS
        .flatMap((d) => walkFiles(node_path_1.default.join(ROOT, d)))
        .filter((f) => f.endsWith(ext));
}
function hasI18nPath(key) {
    let cur = en_js_1.en;
    for (const p of key.split('.')) {
        if (!cur || typeof cur !== 'object' || !(p in cur))
            return false;
        cur = cur[p];
    }
    return cur != null;
}
function lineOf(text, offset) {
    return text.slice(0, offset).split('\n').length;
}
(0, node_test_1.default)('all static i18n t() keys resolve in en.ts', () => {
    const keyRe = /\bt\(\s*(['"])([^'"]+)\1/g;
    const missing = [];
    for (const file of [...sourceFiles('.ts'), ...sourceFiles('.tsx')]) {
        if (file.includes('/src/core/tests/') || file.includes('/src/ui/testing/'))
            continue;
        const text = node_fs_1.default.readFileSync(file, 'utf8');
        let m;
        while ((m = keyRe.exec(text))) {
            const key = m[2];
            if (!key || key.endsWith('.'))
                continue;
            const rest = text.slice(keyRe.lastIndex);
            const next = (rest.match(/^\s*(.)/) || [])[1] ?? '';
            // Skip dynamic-prefix forms like t('grading.label.' + value).
            if (next === '+')
                continue;
            if (!hasI18nPath(key)) {
                missing.push(`${node_path_1.default.relative(ROOT, file)}:${lineOf(text, m.index)} -> ${key}`);
            }
        }
    }
    strict_1.default.equal(missing.length, 0, `Missing i18n keys in en.ts:\n${missing.slice(0, 50).join('\n')}${missing.length > 50 ? `\n... +${missing.length - 50} more` : ''}`);
});
(0, node_test_1.default)('no map callback item is used directly as React key', () => {
    const bad = [];
    const re = /\.map\(\s*\((\w+)(?:\s*,\s*(\w+))?\)\s*=>[\s\S]{0,500}?key=\{\1\}/g;
    for (const file of sourceFiles('.tsx')) {
        if (file.includes('/src/ui/testing/'))
            continue;
        const text = node_fs_1.default.readFileSync(file, 'utf8');
        let m;
        while ((m = re.exec(text))) {
            bad.push(`${node_path_1.default.relative(ROOT, file)}:${lineOf(text, m.index)} -> key={${m[1]}}`);
        }
    }
    strict_1.default.equal(bad.length, 0, `Potential duplicate-key risk: map callback value used directly as key.\n${bad.slice(0, 50).join('\n')}${bad.length > 50 ? `\n... +${bad.length - 50} more` : ''}`);
});
