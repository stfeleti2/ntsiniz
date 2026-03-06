"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevModulesProvider = DevModulesProvider;
exports.useDevModules = useDevModules;
exports.useDevModuleEnabled = useDevModuleEnabled;
exports.useModuleEnabled = useModuleEnabled;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const DEFAULTS = {
    'module.home.hero': true,
    'module.home.recommended': true,
    'module.journey.header': true,
    'module.journey.nextUp': true,
    'module.journey.sessionRow': true,
    'module.session.summary': true,
    'module.results.score': true,
    'module.results.share': true,
    'pattern.playbackOverlay.live': false,
};
// Production behavior: stable modules ON by default.
const PROD_DEFAULTS = {
    'module.home.hero': true,
    'module.home.recommended': true,
    'module.journey.header': true,
    'module.journey.nextUp': true,
    'module.journey.sessionRow': true,
    'module.session.summary': true,
    'module.results.score': true,
    'module.results.share': true,
    // Real take playback is not implemented in storage yet, keep off in prod.
    'pattern.playbackOverlay.live': false,
};
const DevModulesContext = (0, react_1.createContext)(null);
function DevModulesProvider({ children }) {
    const [enabled, setEnabledState] = (0, react_1.useState)(DEFAULTS);
    const setEnabled = (0, react_1.useCallback)((key, value) => {
        setEnabledState((prev) => ({ ...prev, [key]: value }));
    }, []);
    const reset = (0, react_1.useCallback)(() => setEnabledState(DEFAULTS), []);
    const value = (0, react_1.useMemo)(() => ({ enabled, setEnabled, reset }), [enabled, reset, setEnabled]);
    return (0, jsx_runtime_1.jsx)(DevModulesContext.Provider, { value: value, children: children });
}
function useDevModules() {
    const ctx = (0, react_1.useContext)(DevModulesContext);
    if (!ctx) {
        // In production builds (or if provider is missing), behave as defaults.
        return {
            enabled: DEFAULTS,
            setEnabled: () => { },
            reset: () => { },
        };
    }
    return ctx;
}
function useDevModuleEnabled(key) {
    const { enabled } = useDevModules();
    return __DEV__ ? !!enabled[key] : false;
}
/**
 * Use this for modules that should ship in production.
 * In dev, you can toggle them in Component Lab.
 */
function useModuleEnabled(key) {
    const { enabled } = useDevModules();
    return __DEV__ ? !!enabled[key] : !!PROD_DEFAULTS[key];
}
