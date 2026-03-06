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
exports.stopSfx = stopSfx;
exports.playSfx = playSfx;
const FileSystem = __importStar(require("expo-file-system/legacy"));
const fileStore_1 = require("@/core/io/fileStore");
const expo_av_1 = require("expo-av");
const base64_js_1 = require("base64-js");
const session_1 = require("./session");
let modeReady = false;
let current = null;
const uriCache = new Map();
async function stopSfx() {
    try {
        if (current) {
            await current.stopAsync();
            await current.unloadAsync();
        }
    }
    catch {
        // ignore
    }
    finally {
        current = null;
    }
}
/**
 * Plays a subtle, short celebration cue. Uses a generated WAV written to cache.
 * Optional (controlled by settings).
 */
async function playSfx(kind, opts) {
    await ensureMode();
    await session_1.audioSession.enter('sfx');
    try {
        await stopSfx();
        const steps = kindToSteps(kind);
        const key = `sfx:${kind}:${steps.map((s) => `${Math.round(s.freqHz)}@${s.durationMs}+${s.gapMs ?? 0}`).join("|")}`;
        let uri = uriCache.get(key);
        if (!uri) {
            const wav = wavBytesForSequence(steps, 44100);
            const b64 = (0, base64_js_1.fromByteArray)(wav);
            const base = FileSystem.cacheDirectory ?? '';
            uri = `${base}sfx_${hash(key)}.wav`;
            await fileStore_1.fileStore.writeBase64(uri, b64);
            uriCache.set(key, uri);
        }
        const sound = new expo_av_1.Audio.Sound();
        await sound.loadAsync({ uri }, { shouldPlay: true, volume: opts?.volume ?? 0.25 });
        current = sound;
        sound.setOnPlaybackStatusUpdate((st) => {
            if (!st?.isLoaded)
                return;
            if (st.didJustFinish) {
                void (async () => {
                    try {
                        await sound.unloadAsync();
                    }
                    catch { }
                    if (current === sound)
                        current = null;
                })();
            }
        });
        try {
            await sound.playAsync();
        }
        catch {
            try {
                await sound.unloadAsync();
            }
            catch { }
            if (current === sound)
                current = null;
        }
    }
    finally {
        await session_1.audioSession.leave('sfx');
    }
}
function kindToSteps(kind) {
    if (kind === "pb") {
        return [
            { freqHz: 784, durationMs: 85, gapMs: 20 },
            { freqHz: 988, durationMs: 120 },
        ];
    }
    if (kind === "streak") {
        return [
            { freqHz: 659, durationMs: 70, gapMs: 15 },
            { freqHz: 784, durationMs: 95 },
        ];
    }
    return [{ freqHz: 740, durationMs: 90 }];
}
async function ensureMode() {
    if (modeReady)
        return;
    // Force Audio.setAudioModeAsync to the right settings once, but don't hold a ref.
    await session_1.audioSession.enter('sfx');
    await session_1.audioSession.leave('sfx');
    modeReady = true;
}
function wavBytesForSequence(steps, sampleRate) {
    const floats = [];
    for (const s of steps) {
        const n = Math.max(1, Math.floor((s.durationMs / 1000) * sampleRate));
        const fadeN = Math.min(Math.floor(sampleRate * 0.01), Math.floor(n / 2));
        for (let i = 0; i < n; i++) {
            let amp = 0.18;
            if (fadeN > 0) {
                if (i < fadeN)
                    amp *= i / fadeN;
                else if (i > n - fadeN)
                    amp *= (n - i) / fadeN;
            }
            const tt = i / sampleRate;
            floats.push(Math.sin(2 * Math.PI * s.freqHz * tt) * amp);
        }
        const gapMs = s.gapMs ?? 0;
        if (gapMs > 0) {
            const g = Math.floor((gapMs / 1000) * sampleRate);
            for (let i = 0; i < g; i++)
                floats.push(0);
        }
    }
    const pcm = new Uint8Array(floats.length * 2);
    const dv = new DataView(pcm.buffer);
    for (let i = 0; i < floats.length; i++) {
        const v = Math.max(-1, Math.min(1, floats[i]));
        dv.setInt16(i * 2, Math.round(v * 32767), true);
    }
    const header = new Uint8Array(44);
    const h = new DataView(header.buffer);
    writeStr(h, 0, "RIFF");
    h.setUint32(4, 36 + pcm.byteLength, true);
    writeStr(h, 8, "WAVE");
    writeStr(h, 12, "fmt ");
    h.setUint32(16, 16, true);
    h.setUint16(20, 1, true);
    h.setUint16(22, 1, true);
    h.setUint32(24, sampleRate, true);
    h.setUint32(28, sampleRate * 2, true);
    h.setUint16(32, 2, true);
    h.setUint16(34, 16, true);
    writeStr(h, 36, "data");
    h.setUint32(40, pcm.byteLength, true);
    const out = new Uint8Array(header.byteLength + pcm.byteLength);
    out.set(header, 0);
    out.set(pcm, header.byteLength);
    return out;
}
function writeStr(dv, off, s) {
    for (let i = 0; i < s.length; i++)
        dv.setUint8(off + i, s.charCodeAt(i));
}
function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(16);
}
