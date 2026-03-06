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
exports.shareCapturedCard = shareCapturedCard;
const react_native_view_shot_1 = require("react-native-view-shot");
const Sharing = __importStar(require("expo-sharing"));
const FileSystem = __importStar(require("expo-file-system/legacy"));
const logger_1 = require("@/core/observability/logger");
async function shareCapturedCard(ref, filename = 'ntsiniz-card.png') {
    let uri = null;
    try {
        uri = await (0, react_native_view_shot_1.captureRef)(ref, {
            format: 'png',
            quality: 1,
            result: 'tmpfile',
            fileName: filename,
        });
        const ok = await Sharing.isAvailableAsync().catch((e) => {
            logger_1.logger.warn('Sharing.isAvailableAsync failed', { error: e });
            return false;
        });
        if (!ok)
            return;
        await Sharing.shareAsync(uri, { dialogTitle: 'Share', mimeType: 'image/png' });
    }
    finally {
        if (uri) {
            await FileSystem.deleteAsync(uri, { idempotent: true }).catch((e) => logger_1.logger.warn('share capture temp cleanup failed', { error: e }));
        }
    }
}
