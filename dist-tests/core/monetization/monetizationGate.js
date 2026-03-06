"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decideMonetization = decideMonetization;
const monetizationState_1 = require("./monetizationState");
const audioSupervisor_1 = require("@/core/audio/audioSupervisor");
async function decideMonetization() {
    const s = await (0, monetizationState_1.getMonetizationState)();
    const audio = (0, audioSupervisor_1.getAudioSupervisorSnapshot)?.();
    // Never show ads while audio is active.
    if (audio?.state && ['RECORDING', 'PLAYING', 'RECOVERING'].includes(audio.state)) {
        return { canRewarded: false, canInterstitial: false, reason: 'audio_active' };
    }
    const now = Date.now();
    const canRewarded = s.rewardedCount < 2 && (s.lastRewardedAt ? now - s.lastRewardedAt > 10 * 60 * 1000 : true);
    const canInterstitial = s.interstitialCount < 3 && (s.lastInterstitialAt ? now - s.lastInterstitialAt > 8 * 60 * 1000 : true);
    return { canRewarded, canInterstitial };
}
