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
exports.clipsDir = clipsDir;
exports.ensureClipsDir = ensureClipsDir;
exports.persistVideoTemp = persistVideoTemp;
exports.persistImageTemp = persistImageTemp;
exports.persistClipBase64 = persistClipBase64;
const FileSystem = __importStar(require("expo-file-system/legacy"));
const fileStore_1 = require("@/core/io/fileStore");
function clipsDir() {
    return `${FileSystem.documentDirectory ?? ''}clips/`;
}
async function ensureClipsDir() {
    const dir = clipsDir();
    if (!dir)
        throw new Error('Missing documentDirectory');
    const info = await FileSystem.getInfoAsync(dir);
    if (!info.exists)
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    return dir;
}
async function persistVideoTemp(tempUri, clipId) {
    const dir = await ensureClipsDir();
    const dst = `${dir}${clipId}.mp4`;
    // Move if possible; if move fails (cross-device), fallback to copy.
    try {
        await FileSystem.moveAsync({ from: tempUri, to: dst });
    }
    catch {
        await FileSystem.copyAsync({ from: tempUri, to: dst });
        try {
            await FileSystem.deleteAsync(tempUri, { idempotent: true });
        }
        catch { }
    }
    return dst;
}
async function persistImageTemp(tempUri, clipId) {
    const dir = await ensureClipsDir();
    const dst = `${dir}${clipId}.jpg`;
    try {
        await FileSystem.moveAsync({ from: tempUri, to: dst });
    }
    catch {
        await FileSystem.copyAsync({ from: tempUri, to: dst });
        try {
            await FileSystem.deleteAsync(tempUri, { idempotent: true });
        }
        catch { }
    }
    return dst;
}
async function persistClipBase64(params) {
    const dir = await ensureClipsDir();
    const dst = `${dir}${params.clipId}.${params.ext}`;
    await fileStore_1.fileStore.writeBase64(dst, params.base64);
    return dst;
}
