"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppVersion = getAppVersion;
const expo_constants_1 = __importDefault(require("expo-constants"));
function readVersionFromConstants() {
    const cfg = expo_constants_1.default.expoConfig ?? expo_constants_1.default.manifest ?? expo_constants_1.default.manifest2;
    const v = cfg?.version;
    if (typeof v === 'string' && v.trim())
        return v.trim();
    return null;
}
/**
 * Returns the app version as declared in app.config/app.json (Expo).
 *
 * Note: This is used for remote compatibility gates (min/max app version).
 */
function getAppVersion() {
    return readVersionFromConstants() ?? '0.0.0';
}
