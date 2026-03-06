"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultsShareModule = ResultsShareModule;
const jsx_runtime_1 = require("react/jsx-runtime");
const i18n_1 = require("@/app/i18n");
const Card_1 = require("@/ui/components/kit/Card");
const primitives_1 = require("@/ui/primitives");
const ProgressCard_1 = require("@/core/share/ProgressCard");
const ShareActionsModule_1 = require("@/ui/modules/shared/ShareActionsModule");
/**
 * Presentational share card for Results.
 * - Capturing/sharing is handled by the screen via `onShare`.
 * - `cardRef` is forwarded to ProgressCard for screenshot share.
 */
function ResultsShareModule({ cardRef, scoreNow, delta, onShare, toast, testID, }) {
    return ((0, jsx_runtime_1.jsx)(Card_1.Card, { testID: testID, children: (0, jsx_runtime_1.jsxs)(primitives_1.Stack, { gap: 12, children: [(0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "lg", weight: "bold", children: (0, i18n_1.t)('results.shareProgressTitle') }), (0, jsx_runtime_1.jsx)(primitives_1.Box, { style: { alignItems: 'center' }, children: (0, jsx_runtime_1.jsx)(ProgressCard_1.ProgressCard, { ref: cardRef, stats: { label: (0, i18n_1.t)('results.todayLabel'), scoreNow, delta } }) }), (0, jsx_runtime_1.jsx)(ShareActionsModule_1.ShareActionsModule, { primaryLabel: (0, i18n_1.t)('results.share'), onPrimary: onShare, toast: toast, testID: testID ? `${testID}.actions` : undefined })] }) }));
}
