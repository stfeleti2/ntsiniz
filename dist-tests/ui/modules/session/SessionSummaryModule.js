"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionSummaryModule = SessionSummaryModule;
const jsx_runtime_1 = require("react/jsx-runtime");
const i18n_1 = require("@/app/i18n");
const Card_1 = require("@/ui/components/kit/Card");
const Button_1 = require("@/ui/components/kit/Button");
const primitives_1 = require("@/ui/primitives");
function SessionSummaryModule({ title, subtitle, recommendedTitle, primaryLabel, primaryDisabled, onPrimary, planTitle, planItems, testID, }) {
    return ((0, jsx_runtime_1.jsx)(Card_1.Card, { testID: testID, children: (0, jsx_runtime_1.jsxs)(primitives_1.Stack, { gap: 10, children: [(0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "xl", weight: "bold", children: title ?? (0, i18n_1.t)('session.title') }), (0, jsx_runtime_1.jsx)(primitives_1.Text, { tone: "muted", children: subtitle ?? (0, i18n_1.t)('session.subtitle') }), (0, jsx_runtime_1.jsxs)(primitives_1.Stack, { gap: 6, children: [(0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "lg", weight: "bold", children: (0, i18n_1.t)('session.recommendedTitle') }), (0, jsx_runtime_1.jsx)(primitives_1.Text, { tone: "muted", children: (0, i18n_1.t)('session.recommendedSubtitle') }), (0, jsx_runtime_1.jsx)(primitives_1.Text, { weight: "bold", children: recommendedTitle })] }), (0, jsx_runtime_1.jsx)(Button_1.Button, { label: primaryLabel, disabled: !!primaryDisabled, onPress: onPrimary, testID: testID ? `${testID}.primary` : undefined }), planItems?.length ? ((0, jsx_runtime_1.jsxs)(primitives_1.Stack, { gap: 6, children: [(0, jsx_runtime_1.jsx)(primitives_1.Text, { tone: "muted", size: "sm", children: planTitle ?? (0, i18n_1.t)('session.planTitle') }), planItems.map((it, idx) => ((0, jsx_runtime_1.jsxs)(primitives_1.Text, { tone: it.isDone ? 'muted' : 'default', weight: it.isCurrent ? 'bold' : 'semibold', children: [idx + 1, ". ", it.label] }, `${it.id}-${idx}`)))] })) : null] }) }));
}
