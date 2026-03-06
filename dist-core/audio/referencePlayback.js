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
exports.playMandatoryReference = playMandatoryReference;
const FileSystem = __importStar(require("expo-file-system/legacy"));
const expo_av_1 = require("expo-av");
const session_1 = require("@/core/audio/session");
const referenceTones_1 = require("@/core/audio/referenceTones");
const logger_1 = require("@/core/observability/logger");
async function cacheIfRemote(uri) {
    if (!uri.startsWith('http://') && !uri.startsWith('https://'))
        return uri;
    const hash = uri.replace(/[^a-z0-9]+/gi, '_').slice(0, 80);
    const target = `${FileSystem.cacheDirectory}ref_${hash}`;
    const info = await FileSystem.getInfoAsync(target);
    if (info.exists)
        return target;
    await FileSystem.downloadAsync(uri, target);
    return target;
}
async function playClipOnce(uri) {
    await session_1.audioSession.enter('playback').catch((e) => logger_1.logger.warn('audioSession.enter(playback) failed', e));
    const s = new expo_av_1.Audio.Sound();
    try {
        await s.loadAsync({ uri }, { shouldPlay: false }, false);
        await s.playAsync();
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('reference_clip_timeout'));
            }, 12_000);
            s.setOnPlaybackStatusUpdate((st) => {
                if (!st?.isLoaded)
                    return;
                if (st.didJustFinish) {
                    clearTimeout(timeout);
                    resolve();
                }
            });
        });
    }
    finally {
        try {
            await s.stopAsync();
        }
        catch { }
        try {
            await s.unloadAsync();
        }
        catch { }
        await session_1.audioSession.leave('playback').catch((e) => logger_1.logger.warn('audioSession.leave(playback) failed', e));
    }
}
/**
 * Mandatory pre-roll reference: makes drills feel like lessons.
 * Flow: play guide clip OR synth reference tone, then return.
 */
async function playMandatoryReference(drill, opts) {
    const override = opts?.overrideUri ?? null;
    const refUri = override || drill.referenceUri || drill.demoUri || null;
    if (refUri) {
        const cached = await cacheIfRemote(refUri);
        await playClipOnce(cached);
        return;
    }
    // Fall back to synthesized reference tones (must exist for all drills via pack-doctor).
    await (0, referenceTones_1.playReferenceForDrill)(drill);
}
