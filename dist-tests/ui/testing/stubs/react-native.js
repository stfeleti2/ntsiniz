"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Easing = exports.Animated = exports.useColorScheme = exports.useWindowDimensions = exports.Linking = exports.PixelRatio = exports.Dimensions = exports.AppState = exports.Alert = exports.Platform = exports.StyleSheet = exports.ActivityIndicator = exports.KeyboardAvoidingView = exports.TouchableOpacity = exports.TextInput = exports.FlatList = exports.Image = exports.Modal = exports.SafeAreaView = exports.ScrollView = exports.Pressable = exports.Text = exports.View = void 0;
const react_1 = __importDefault(require("react"));
function host(name) {
    return react_1.default.forwardRef((props, ref) => react_1.default.createElement(name, { ...props, ref }, props.children));
}
exports.View = host('View');
exports.Text = host('Text');
exports.Pressable = host('Pressable');
exports.ScrollView = host('ScrollView');
exports.SafeAreaView = host('SafeAreaView');
exports.Modal = host('Modal');
exports.Image = host('Image');
exports.FlatList = host('FlatList');
exports.TextInput = host('TextInput');
exports.TouchableOpacity = host('TouchableOpacity');
exports.KeyboardAvoidingView = host('KeyboardAvoidingView');
exports.ActivityIndicator = host('ActivityIndicator');
exports.StyleSheet = {
    create(styles) {
        return styles;
    },
    absoluteFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
};
exports.Platform = {
    OS: 'ios',
    select(value) {
        return value.ios ?? value.default;
    },
};
exports.Alert = {
    alert: (..._args) => { },
};
exports.AppState = {
    addEventListener: () => ({ remove: () => { } }),
};
exports.Dimensions = {
    get: () => ({ width: 390, height: 844, scale: 3, fontScale: 1 }),
};
exports.PixelRatio = {
    get: () => 3,
};
exports.Linking = {
    openURL: async () => true,
    canOpenURL: async () => true,
};
const useWindowDimensions = () => ({ width: 390, height: 844, scale: 3, fontScale: 1 });
exports.useWindowDimensions = useWindowDimensions;
const useColorScheme = () => 'dark';
exports.useColorScheme = useColorScheme;
const AnimatedView = host('AnimatedView');
exports.Animated = { View: AnimatedView };
exports.Easing = { inOut: (x) => x, quad: {} };
const ReactNative = {
    View: exports.View,
    Text: exports.Text,
    Pressable: exports.Pressable,
    ScrollView: exports.ScrollView,
    SafeAreaView: exports.SafeAreaView,
    Modal: exports.Modal,
    Image: exports.Image,
    FlatList: exports.FlatList,
    TextInput: exports.TextInput,
    TouchableOpacity: exports.TouchableOpacity,
    KeyboardAvoidingView: exports.KeyboardAvoidingView,
    ActivityIndicator: exports.ActivityIndicator,
    StyleSheet: exports.StyleSheet,
    Platform: exports.Platform,
    Alert: exports.Alert,
    AppState: exports.AppState,
    Dimensions: exports.Dimensions,
    PixelRatio: exports.PixelRatio,
    Linking: exports.Linking,
    useWindowDimensions: exports.useWindowDimensions,
    useColorScheme: exports.useColorScheme,
    Animated: exports.Animated,
    Easing: exports.Easing,
};
exports.default = ReactNative;
