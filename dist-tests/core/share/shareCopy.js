"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShareFooter = getShareFooter;
const links_1 = require("@/core/config/links");
/**
 * Single source of truth for share-sheet link copy.
 * Keep it short and stable (works across WhatsApp / iMessage / Instagram).
 */
function getShareFooter() {
    const { appUrl } = (0, links_1.getPublicLinks)();
    if (!appUrl)
        return undefined;
    return `Get Ntsiniz: ${appUrl}`;
}
