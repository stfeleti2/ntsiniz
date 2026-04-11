"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewardedBoostCard = RewardedBoostCard;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const Card_1 = require("@/ui/components/Card");
const Typography_1 = require("@/ui/components/Typography");
const Button_1 = require("@/ui/components/Button");
const ui_1 = require("@/ui");
const i18n_1 = require("@/app/i18n");
const monetizationGate_1 = require("@/core/monetization/monetizationGate");
const monetizationState_1 = require("@/core/monetization/monetizationState");
/**
 * Rewarded ads entry point (safe placement).
 * This is provider-agnostic; wire AdMob later.
 */
function RewardedBoostCard({ surface }) {
    const [enabled, setEnabled] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        (0, monetizationGate_1.decideMonetization)({ surface }).then((d) => setEnabled(!!d.canRewarded));
    }, [surface]);
    if (!enabled)
        return null;
    return ((0, jsx_runtime_1.jsxs)(Card_1.Card, { tone: "glow", children: [(0, jsx_runtime_1.jsx)(Typography_1.Text, { preset: "h2", children: (0, i18n_1.t)('monet.rewarded.title') ?? 'Boost tomorrow' }), (0, jsx_runtime_1.jsx)(Typography_1.Text, { preset: "muted", children: (0, i18n_1.t)('monet.rewarded.body') ?? 'Watch 1 ad to add an extra drill to tomorrow’s plan.' }), (0, jsx_runtime_1.jsx)(ui_1.Box, { style: { height: 10 } }), (0, jsx_runtime_1.jsx)(Button_1.Button, { text: (0, i18n_1.t)('monet.rewarded.cta') ?? 'Watch & Boost', onPress: async () => {
                    // Stub behavior for now: mark as claimed.
                    const cur = await (0, monetizationState_1.getMonetizationState)();
                    await (0, monetizationState_1.updateMonetizationState)({ rewardedCount: (cur.rewardedCount ?? 0) + 1, lastRewardedAt: Date.now() });
                    setEnabled(false);
                } })] }));
}
