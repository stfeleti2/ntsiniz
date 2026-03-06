"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionRowModule = SessionRowModule;
const jsx_runtime_1 = require("react/jsx-runtime");
const i18n_1 = require("@/app/i18n");
const ListRow_1 = require("@/ui/components/kit/ListRow");
function SessionRowModule({ session, onPress, testID, }) {
    const day = new Date(session.startedAt);
    const title = day.toLocaleDateString();
    const subtitle = (0, i18n_1.t)('journey.sessionRowSubtitle', { attempts: session.attemptCount, score: session.avgScore });
    return (0, jsx_runtime_1.jsx)(ListRow_1.ListRow, { title: title, subtitle: subtitle, onPress: onPress, testID: testID });
}
