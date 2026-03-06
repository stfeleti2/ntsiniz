"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const node_module_1 = __importDefault(require("node:module"));
const root = process.cwd();
const distRoot = node_path_1.default.join(root, 'dist-tests');
const stubs = {
    'react-native': node_path_1.default.join(distRoot, 'ui/testing/stubs/react-native.js'),
    'react-native-reanimated': node_path_1.default.join(distRoot, 'ui/testing/stubs/react-native-reanimated.js'),
    'expo-linear-gradient': node_path_1.default.join(distRoot, 'ui/testing/stubs/expo-linear-gradient.js'),
    'expo-haptics': node_path_1.default.join(distRoot, 'ui/testing/stubs/expo-haptics.js'),
    'expo-constants': node_path_1.default.join(distRoot, 'ui/testing/stubs/expo-constants.js'),
    'expo-av': node_path_1.default.join(distRoot, 'ui/testing/stubs/expo-av.js'),
    'expo-file-system': node_path_1.default.join(distRoot, 'ui/testing/stubs/expo-file-system.js'),
    'expo-file-system/legacy': node_path_1.default.join(distRoot, 'ui/testing/stubs/expo-file-system.js'),
    'ntsiniz-audio-route': node_path_1.default.join(distRoot, 'ui/testing/stubs/ntsiniz-audio-route.js'),
};
function resolveAliasPath(request) {
    const rel = request.slice(2); // strip "@/..."
    const base = node_path_1.default.join(distRoot, rel);
    const candidates = [`${base}.js`, `${base}.jsx`, node_path_1.default.join(base, 'index.js')];
    for (const c of candidates) {
        if (node_fs_1.default.existsSync(c))
            return c;
    }
    return `${base}.js`;
}
const modAny = node_module_1.default;
const originalResolveFilename = modAny._resolveFilename.bind(node_module_1.default);
modAny._resolveFilename = function patchedResolveFilename(request, parent, isMain, options) {
    if (process.env.UI_TEST_TRACE === '1') {
        console.error('[ui-test-resolve]', request);
    }
    if (request.startsWith('@/')) {
        return resolveAliasPath(request);
    }
    const stub = stubs[request];
    if (stub)
        return stub;
    return originalResolveFilename(request, parent, isMain, options);
};
globalThis.__DEV__ = false;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0);
const filteredWarning = 'react-test-renderer is deprecated. See https://react.dev/warnings/react-test-renderer';
const originalWarn = console.warn.bind(console);
const originalError = console.error.bind(console);
console.warn = (...args) => {
    const first = typeof args[0] === 'string' ? args[0] : '';
    if (first.includes(filteredWarning))
        return;
    originalWarn(...args);
};
console.error = (...args) => {
    const first = typeof args[0] === 'string' ? args[0] : '';
    if (first.includes(filteredWarning))
        return;
    originalError(...args);
};
