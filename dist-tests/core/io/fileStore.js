"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileStore = void 0;
const FileSystem = __importStar(require("expo-file-system/legacy"));
/**
 * Centralized file IO. Keep base64 reads/writes out of UI code where possible.
 * This module is intentionally small (no extra deps).
 */
exports.fileStore = {
    async ensureDir(dirUri) {
        const info = await FileSystem.getInfoAsync(dirUri);
        if (info.exists)
            return;
        await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true });
    },
    async writeText(uri, text, opts = {}) {
        await FileSystem.writeAsStringAsync(uri, text, { encoding: (opts.encoding ?? 'utf8') });
    },
    async readText(uri, opts = {}) {
        return await FileSystem.readAsStringAsync(uri, { encoding: (opts.encoding ?? 'utf8') });
    },
    async writeBase64(uri, base64) {
        await FileSystem.writeAsStringAsync(uri, base64, { encoding: 'base64' });
    },
    async readBase64(uri) {
        return await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
    },
    async tryCopy(src, dst, opts = {}) {
        try {
            const dstInfo = await FileSystem.getInfoAsync(dst);
            if (dstInfo.exists && !opts.overwrite)
                return true;
            await FileSystem.copyAsync({ from: src, to: dst });
            return true;
        }
        catch {
            return false;
        }
    },
    async copyWithBase64Fallback(src, dst) {
        const ok = await this.tryCopy(src, dst, { overwrite: true });
        if (ok)
            return;
        const b64 = await this.readBase64(src);
        await this.writeBase64(dst, b64);
    },
    async deleteIfExists(uri) {
        try {
            const info = await FileSystem.getInfoAsync(uri);
            if (info.exists)
                await FileSystem.deleteAsync(uri, { idempotent: true });
        }
        catch {
            // noop
        }
    },
};
