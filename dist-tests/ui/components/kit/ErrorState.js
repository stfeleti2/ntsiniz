"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorState = ErrorState;
const jsx_runtime_1 = require("react/jsx-runtime");
const primitives_1 = require("../../primitives");
const Button_1 = require("./Button");
const i18n_1 = require("@/app/i18n");
function ErrorState({ title, message, onRetry, style, testID, }) {
    return ((0, jsx_runtime_1.jsxs)(primitives_1.Stack, { testID: testID, gap: 12, align: "center", style: [{ padding: 16 }, style], children: [(0, jsx_runtime_1.jsx)(primitives_1.Text, { weight: "bold", size: "lg", tone: "danger", style: { textAlign: 'center' }, children: title }), message ? (0, jsx_runtime_1.jsx)(primitives_1.Text, { tone: "muted", style: { textAlign: 'center' }, children: message }) : null, onRetry ? (0, jsx_runtime_1.jsx)(Button_1.Button, { label: (0, i18n_1.t)('common.retry'), onPress: onRetry, testID: testID ? `${testID}.retry` : undefined }) : null] }));
}
