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
exports.audioRouteEmitter = exports.DEFAULT_VOCAL_PRESET = void 0;
exports.configureForVocalCapture = configureForVocalCapture;
exports.getCurrentRoute = getCurrentRoute;
exports.listInputs = listInputs;
exports.setPreferredInput = setPreferredInput;
const AudioRoute = __importStar(require("ntsiniz-audio-route"));
// Defaults tuned for singing + realtime feedback:
// - Prefer 48k where available for better spectral resolution.
// - Use ~10ms IO buffer for responsive feedback without extreme CPU.
exports.DEFAULT_VOCAL_PRESET = {
    allowBluetooth: true,
    preferBuiltInMic: false,
    preferredSampleRateHz: 48000,
    preferredIOBufferDurationMs: 10,
};
async function configureForVocalCapture(preset = {}) {
    const cfg = { ...exports.DEFAULT_VOCAL_PRESET, ...preset };
    await AudioRoute.configureVocalCapture({
        allowBluetooth: cfg.allowBluetooth,
        preferBuiltInMic: cfg.preferBuiltInMic,
        preferredSampleRateHz: cfg.preferredSampleRateHz,
        preferredIOBufferDurationMs: cfg.preferredIOBufferDurationMs,
    });
}
async function getCurrentRoute() {
    return AudioRoute.getCurrentRoute();
}
async function listInputs() {
    return AudioRoute.listInputs();
}
async function setPreferredInput(uid) {
    return AudioRoute.setPreferredInput(uid);
}
exports.audioRouteEmitter = AudioRoute.audioRouteEmitter;
