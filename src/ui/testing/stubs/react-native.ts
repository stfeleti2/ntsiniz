import React from 'react'

function host(name: string) {
  return React.forwardRef<any, any>((props, ref) => React.createElement(name, { ...props, ref }, props.children))
}

export const View = host('View')
export const Text = host('Text')
export const Pressable = host('Pressable')
export const ScrollView = host('ScrollView')
export const SafeAreaView = host('SafeAreaView')
export const Modal = host('Modal')
export const Image = host('Image')
export const FlatList = host('FlatList')
export const TextInput = host('TextInput')
export const TouchableOpacity = host('TouchableOpacity')
export const KeyboardAvoidingView = host('KeyboardAvoidingView')
export const ActivityIndicator = host('ActivityIndicator')

export const StyleSheet = {
  create<T extends Record<string, any>>(styles: T): T {
    return styles
  },
  absoluteFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
}

export const Platform = {
  OS: 'ios',
  select<T>(value: { ios?: T; android?: T; default?: T }): T | undefined {
    return value.ios ?? value.default
  },
}

export const Alert = {
  alert: (..._args: any[]) => {},
}

export const AppState = {
  addEventListener: () => ({ remove: () => {} }),
}

export const Dimensions = {
  get: () => ({ width: 390, height: 844, scale: 3, fontScale: 1 }),
}

export const PixelRatio = {
  get: () => 3,
}

export const Linking = {
  openURL: async () => true,
  canOpenURL: async () => true,
}

export const useWindowDimensions = () => ({ width: 390, height: 844, scale: 3, fontScale: 1 })

const AnimatedView = host('AnimatedView')
export const Animated = { View: AnimatedView }
export const Easing = { inOut: (x: any) => x, quad: {} }

const ReactNative = {
  View,
  Text,
  Pressable,
  ScrollView,
  SafeAreaView,
  Modal,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Alert,
  AppState,
  Dimensions,
  PixelRatio,
  Linking,
  useWindowDimensions,
  Animated,
  Easing,
}

export default ReactNative
