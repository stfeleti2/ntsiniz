"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeProvider = ThemeProvider;
exports.useTheme = useTheme;
exports.useThemeControls = useThemeControls;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const theme_1 = require("./theme");
const defaultControls = {
    mode: 'dark',
    setMode: () => { },
    effectiveMode: 'dark',
    motionPreset: 'normal',
    setMotionPreset: () => { },
    reducedMotion: false,
    setReducedMotion: () => { },
};
const ThemeContext = (0, react_1.createContext)({
    theme: theme_1.theme,
    controls: defaultControls,
});
function ThemeProvider({ theme, children, mode: modeProp, motionPreset: motionPresetProp, reducedMotion: reducedMotionProp, }) {
    const deviceScheme = (0, react_native_1.useColorScheme)();
    const [mode, setMode] = (0, react_1.useState)(modeProp ?? 'dark');
    const [motionPreset, setMotionPreset] = (0, react_1.useState)(motionPresetProp ?? 'normal');
    const [reducedMotion, setReducedMotion] = (0, react_1.useState)(reducedMotionProp ?? false);
    (0, react_1.useEffect)(() => {
        if (modeProp)
            setMode(modeProp);
    }, [modeProp]);
    (0, react_1.useEffect)(() => {
        if (motionPresetProp)
            setMotionPreset(motionPresetProp);
    }, [motionPresetProp]);
    (0, react_1.useEffect)(() => {
        if (typeof reducedMotionProp === 'boolean')
            setReducedMotion(reducedMotionProp);
    }, [reducedMotionProp]);
    const effectiveMode = (mode === 'system' ? (deviceScheme === 'light' ? 'light' : 'dark') : mode) ?? 'dark';
    const resolvedTheme = (0, react_1.useMemo)(() => {
        if (theme)
            return theme;
        return (0, theme_1.buildTheme)({
            mode: effectiveMode,
            motionPreset,
            reducedMotion,
        });
    }, [theme, effectiveMode, motionPreset, reducedMotion]);
    const controls = (0, react_1.useMemo)(() => ({
        mode,
        setMode,
        effectiveMode,
        motionPreset,
        setMotionPreset,
        reducedMotion,
        setReducedMotion,
    }), [mode, effectiveMode, motionPreset, reducedMotion]);
    const value = (0, react_1.useMemo)(() => ({
        theme: resolvedTheme,
        controls,
    }), [resolvedTheme, controls]);
    return (0, jsx_runtime_1.jsx)(ThemeContext.Provider, { value: value, children: children });
}
function useTheme() {
    return (0, react_1.useContext)(ThemeContext).theme;
}
function useThemeControls() {
    return (0, react_1.useContext)(ThemeContext).controls;
}
