"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.audioSession = void 0;
const expo_av_1 = require("expo-av");
const interruptions_1 = require("./interruptions");
const AudioAny = expo_av_1.Audio;
const MODE = {
    idle: {
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: AudioAny.InterruptionModeIOS?.DoNotMix ?? 1,
        interruptionModeAndroid: AudioAny.InterruptionModeAndroid?.DoNotMix ?? 1,
        shouldDuckAndroid: true,
    },
    sfx: {
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: AudioAny.InterruptionModeIOS?.DoNotMix ?? 1,
        interruptionModeAndroid: AudioAny.InterruptionModeAndroid?.DoNotMix ?? 1,
        shouldDuckAndroid: true,
    },
    tone: {
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: AudioAny.InterruptionModeIOS?.DoNotMix ?? 1,
        interruptionModeAndroid: AudioAny.InterruptionModeAndroid?.DoNotMix ?? 1,
        shouldDuckAndroid: true,
    },
    playback: {
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: AudioAny.InterruptionModeIOS?.DoNotMix ?? 1,
        interruptionModeAndroid: AudioAny.InterruptionModeAndroid?.DoNotMix ?? 1,
        shouldDuckAndroid: true,
    },
    record: {
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: AudioAny.InterruptionModeIOS?.DoNotMix ?? 1,
        interruptionModeAndroid: AudioAny.InterruptionModeAndroid?.DoNotMix ?? 1,
        shouldDuckAndroid: true,
    },
};
/**
 * Single owner of Audio.setAudioModeAsync.
 * Prevents different modules from racing/overwriting audio session mode.
 */
class AudioSessionManager {
    ref = new Map();
    current = 'idle';
    applying = null;
    async enter(mode) {
        this.ref.set(mode, (this.ref.get(mode) ?? 0) + 1);
        await this.applyBestMode();
    }
    async leave(mode) {
        const n = (this.ref.get(mode) ?? 0) - 1;
        if (n <= 0)
            this.ref.delete(mode);
        else
            this.ref.set(mode, n);
        await this.applyBestMode();
    }
    getCurrentMode() {
        return this.current;
    }
    desiredMode() {
        // priority order: record > playback > tone > sfx > idle
        if (this.ref.has('record'))
            return 'record';
        if (this.ref.has('playback'))
            return 'playback';
        if (this.ref.has('tone'))
            return 'tone';
        if (this.ref.has('sfx'))
            return 'sfx';
        return 'idle';
    }
    async applyBestMode() {
        const next = this.desiredMode();
        if (next === this.current)
            return;
        // Serialize audio mode changes to avoid races.
        const run = async () => {
            const cfg = MODE[next];
            try {
                await expo_av_1.Audio.setAudioModeAsync({
                    allowsRecordingIOS: cfg.allowsRecordingIOS,
                    playsInSilentModeIOS: cfg.playsInSilentModeIOS,
                    staysActiveInBackground: cfg.staysActiveInBackground,
                    interruptionModeIOS: cfg.interruptionModeIOS,
                    interruptionModeAndroid: cfg.interruptionModeAndroid,
                    shouldDuckAndroid: cfg.shouldDuckAndroid,
                });
            }
            catch (e) {
                (0, interruptions_1.notifyAudioSessionError)(String(e?.message ?? e));
                throw e;
            }
            this.current = next;
        };
        this.applying = (this.applying ?? Promise.resolve()).then(run, run).finally(() => {
            // keep chain alive but clear pointer to avoid memory leak
            this.applying = null;
        });
        await this.applying;
    }
}
exports.audioSession = new AudioSessionManager();
