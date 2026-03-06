"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttemptListModule = AttemptListModule;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const primitives_1 = require("@/ui/primitives");
const i18n_1 = require("@/app/i18n");
const devModules_1 = require("../devModules");
const AttemptRowModule_1 = require("./AttemptRowModule");
const AttemptRowCompactModule_1 = require("./AttemptRowCompactModule");
/**
 * UI-only module.
 * Turns raw attempts into a consistent, shareable list layout.
 */
function AttemptListModule({ attempts, drillTitleById, getAudioUri, bestAttemptIdByDrillId, onOpenAttempt, variant = 'detailed', testID }) {
    const livePlayback = (0, devModules_1.useDevModuleEnabled)('pattern.playbackOverlay.live');
    const bestByDrill = (0, react_1.useMemo)(() => {
        const map = {};
        for (const a of attempts) {
            const cur = map[a.drillId];
            if (!cur || a.score >= cur.score)
                map[a.drillId] = { id: a.id, score: a.score };
        }
        const out = {};
        for (const k of Object.keys(map))
            out[k] = map[k].id;
        return bestAttemptIdByDrillId ? { ...out, ...bestAttemptIdByDrillId } : out;
    }, [attempts, bestAttemptIdByDrillId]);
    if (!attempts.length) {
        return ((0, jsx_runtime_1.jsx)(primitives_1.Box, { testID: testID, children: (0, jsx_runtime_1.jsx)(primitives_1.Text, { tone: "muted", children: (0, i18n_1.t)('results.noAttempts') }) }));
    }
    return ((0, jsx_runtime_1.jsx)(primitives_1.Box, { testID: testID, style: { gap: 10 }, children: attempts.map((a, idx) => (variant === 'compact' ? ((0, jsx_runtime_1.jsx)(AttemptRowCompactModule_1.AttemptRowCompactModule, { attempt: a, index: idx, isBest: bestByDrill[a.drillId] === a.id, drillTitleById: drillTitleById, parentTestID: testID }, a.id)) : ((0, jsx_runtime_1.jsx)(AttemptRowModule_1.AttemptRowModule, { attempt: a, index: idx, isBest: bestByDrill[a.drillId] === a.id, drillTitleById: drillTitleById, livePlayback: livePlayback, getAudioUri: getAudioUri, onOpenAttempt: onOpenAttempt, parentTestID: testID, showDivider: idx < attempts.length - 1 }, a.id)))) }));
}
