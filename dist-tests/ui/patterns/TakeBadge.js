"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TakeBadge = TakeBadge;
const jsx_runtime_1 = require("react/jsx-runtime");
const Badge_1 = require("../components/kit/Badge");
const i18n_1 = require("@/app/i18n");
function TakeBadge({ status, testID }) {
    const label = status === 'best' ? (0, i18n_1.t)('common.bestTake') : status === 'saved' ? (0, i18n_1.t)('common.saved') : (0, i18n_1.t)('common.new');
    const tone = status === 'best' ? 'success' : status === 'saved' ? 'default' : 'warning';
    return (0, jsx_runtime_1.jsx)(Badge_1.Badge, { testID: testID, label: label, tone: tone });
}
