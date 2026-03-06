"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultsScoreModule = ResultsScoreModule;
const jsx_runtime_1 = require("react/jsx-runtime");
const i18n_1 = require("@/app/i18n");
const Card_1 = require("@/ui/components/kit/Card");
const primitives_1 = require("@/ui/primitives");
const ScoreKpiRowModule_1 = require("@/ui/modules/shared/ScoreKpiRowModule");
/**
 * Presentational score card for Results.
 * - No business logic.
 * - Callers can inject decorations (e.g. SparkleBurst) via `scoreDecoration`.
 */
function ResultsScoreModule({ score, deltaValue, milestones, scoreDecoration, testID, }) {
    return ((0, jsx_runtime_1.jsx)(Card_1.Card, { testID: testID, children: (0, jsx_runtime_1.jsxs)(primitives_1.Stack, { gap: 10, children: [(0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "lg", weight: "bold", children: (0, i18n_1.t)('results.scoreTitle') }), (0, jsx_runtime_1.jsxs)(primitives_1.Box, { style: { position: 'relative', alignSelf: 'flex-start' }, children: [scoreDecoration, (0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "2xl", weight: "bold", children: Math.round(score) })] }), (0, jsx_runtime_1.jsx)(ScoreKpiRowModule_1.ScoreKpiRowModule, { label: (0, i18n_1.t)('results.baselineLabel'), value: deltaValue, testID: testID ? `${testID}.delta` : undefined }), milestones?.day7 ? ((0, jsx_runtime_1.jsx)(ScoreKpiRowModule_1.ScoreKpiRowModule, { label: (0, i18n_1.t)('results.day7Label'), value: milestones.day7, testID: testID ? `${testID}.day7` : undefined })) : null, milestones?.day30 ? ((0, jsx_runtime_1.jsx)(ScoreKpiRowModule_1.ScoreKpiRowModule, { label: (0, i18n_1.t)('results.day30Label'), value: milestones.day30, testID: testID ? `${testID}.day30` : undefined })) : null] }) }));
}
