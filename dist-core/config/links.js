"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicLinks = getPublicLinks;
const expo_constants_1 = __importDefault(require("expo-constants"));
function readExtraString(key) {
    const extra = expo_constants_1.default?.expoConfig?.extra ?? expo_constants_1.default?.manifest?.extra;
    const v = extra?.[key];
    return typeof v === 'string' && v.trim().length ? v.trim() : undefined;
}
/**
 * Public URLs used in share sheets and legal pages.
 * In production builds we fail fast if these are missing to avoid shipping broken links.
 */
function getPublicLinks() {
    const appUrl = readExtraString('publicAppUrl') ?? '';
    const inviteUrlBase = readExtraString('publicInviteUrlBase') ?? `${appUrl.replace(/\/$/, '')}/invite`;
    return { appUrl, inviteUrlBase };
}
