"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Audio = exports.Video = exports.ResizeMode = void 0;
const react_1 = __importDefault(require("react"));
exports.ResizeMode = {
    CONTAIN: 'contain',
    COVER: 'cover',
    STRETCH: 'stretch',
};
exports.Video = react_1.default.forwardRef((props, ref) => react_1.default.createElement('Video', { ...props, ref }, props.children));
class Sound {
    async loadAsync() { }
    async playAsync() { }
    async stopAsync() { }
    async unloadAsync() { }
    setOnPlaybackStatusUpdate() { }
}
exports.Audio = {
    Sound,
    setAudioModeAsync: async () => { },
    InterruptionModeIOS: { DoNotMix: 1 },
    InterruptionModeAndroid: { DoNotMix: 1 },
};
exports.default = { Video: exports.Video, Audio: exports.Audio, ResizeMode: exports.ResizeMode };
