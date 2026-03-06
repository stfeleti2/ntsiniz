"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeProvider = ThemeProvider;
exports.useTheme = useTheme;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const theme_1 = require("./theme");
const ThemeContext = (0, react_1.createContext)(theme_1.theme);
function ThemeProvider({ theme, children }) {
    const value = (0, react_1.useMemo)(() => theme ?? theme_1.theme, [theme]);
    return (0, jsx_runtime_1.jsx)(ThemeContext.Provider, { value: value, children: children });
}
function useTheme() {
    return (0, react_1.useContext)(ThemeContext);
}
