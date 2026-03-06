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
exports.recoverOrphanTakes = recoverOrphanTakes;
const FileSystem = __importStar(require("expo-file-system/legacy"));
const fileStore_1 = require("@/core/io/fileStore");
const takeFilesRepo_1 = require("@/core/storage/takeFilesRepo");
const logger_1 = require("@/core/observability/logger");
/**
 * If the app is killed mid-save, we may leave `.wav.tmp` files behind.
 * This recovers them by renaming to `.wav` on next launch.
 */
async function recoverOrphanTakes() {
    const base = FileSystem.cacheDirectory;
    if (!base)
        return { recovered: 0, recoveredUris: [] };
    const dir = `${base}ntsiniz/takes`;
    const info = await FileSystem.getInfoAsync(dir);
    if (!info.exists)
        return { recovered: 0, recoveredUris: [] };
    const files = await FileSystem.readDirectoryAsync(dir);
    const tmps = files.filter((f) => f.endsWith('.wav.tmp'));
    if (!tmps.length)
        return { recovered: 0, recoveredUris: [] };
    const recoveredUris = [];
    const reconciles = [];
    for (const f of tmps) {
        const tmpUri = `${dir}/${f}`;
        const finalUri = `${dir}/${f.replace(/\.tmp$/, '')}`;
        try {
            // If final already exists, keep it and delete tmp.
            const finalInfo = await FileSystem.getInfoAsync(finalUri);
            if (finalInfo.exists) {
                await fileStore_1.fileStore.deleteIfExists(tmpUri);
                continue;
            }
            await FileSystem.moveAsync({ from: tmpUri, to: finalUri });
            recoveredUris.push(finalUri);
            reconciles.push({ from: tmpUri, to: finalUri });
            await (0, takeFilesRepo_1.upsertTakeFile)({ path: finalUri, tmpPath: null, status: 'saved', meta: {} }).catch((e) => logger_1.logger.warn('take recovery: db upsert failed', { error: e }));
        }
        catch {
            // If move fails, best-effort delete so we don't repeatedly nag.
            await fileStore_1.fileStore.deleteIfExists(tmpUri).catch((e) => logger_1.logger.warn('take recovery: tmp delete failed', { error: e }));
        }
    }
    await (0, takeFilesRepo_1.reconcileTakeFilePaths)(reconciles).catch((e) => logger_1.logger.warn('take recovery: reconcile paths failed', { error: e }));
    return { recovered: recoveredUris.length, recoveredUris };
}
