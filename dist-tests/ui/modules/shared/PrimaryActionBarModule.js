"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrimaryActionBarModule = PrimaryActionBarModule;
const jsx_runtime_1 = require("react/jsx-runtime");
const primitives_1 = require("@/ui/primitives");
const kit_1 = require("@/ui/components/kit");
/**
 * Bottom action bar used by screens to keep primary CTA consistent.
 * UI-only.
 */
function PrimaryActionBarModule({ primaryLabel, onPrimary, onPrimaryPress, secondaryLabel, onSecondary, onSecondaryPress, disabled, testID, style, }) {
    const handlePrimary = onPrimaryPress ?? onPrimary ?? (() => { });
    const handleSecondary = onSecondaryPress ?? onSecondary;
    return ((0, jsx_runtime_1.jsxs)(primitives_1.Box, { testID: testID, style: [
            {
                flexDirection: 'row',
                gap: 10,
                justifyContent: 'space-between',
            },
            style,
        ], children: [secondaryLabel && handleSecondary ? ((0, jsx_runtime_1.jsx)(primitives_1.Box, { style: { flex: 1 }, children: (0, jsx_runtime_1.jsx)(kit_1.Button, { variant: "secondary", label: secondaryLabel, onPress: handleSecondary, disabled: disabled, testID: testID ? `${testID}.secondary` : undefined }) })) : null, (0, jsx_runtime_1.jsx)(primitives_1.Box, { style: { flex: 1 }, children: (0, jsx_runtime_1.jsx)(kit_1.Button, { label: primaryLabel, onPress: handlePrimary, disabled: disabled, testID: testID ? `${testID}.primary` : undefined }) })] }));
}
