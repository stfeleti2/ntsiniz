"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttemptWaveformList = AttemptWaveformList;
const jsx_runtime_1 = require("react/jsx-runtime");
const AttemptListModule_1 = require("./attempts/AttemptListModule");
/**
 * Back-compat wrapper.
 * Prefer using AttemptListModule + AttemptRowModule.
 */
function AttemptWaveformList({ attempts, drillTitleById, getAudioUri, bestAttemptIdByDrillId, onOpenAttempt, testID, }) {
    return ((0, jsx_runtime_1.jsx)(AttemptListModule_1.AttemptListModule, { attempts: attempts, drillTitleById: drillTitleById, getAudioUri: getAudioUri, bestAttemptIdByDrillId: bestAttemptIdByDrillId, onOpenAttempt: onOpenAttempt, testID: testID }));
}
