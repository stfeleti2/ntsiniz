// These shims exist so we can compile core logic for Node tests without
// requiring native Expo modules or Node type packages.

// Node test shims (avoid @types/node dependency)
declare module "node:test" {
  const test: any
  export default test
}

declare module "node:assert/strict" {
  const assert: any
  export default assert
}

// JSON import/require helper
declare function require(path: string): any

// Expo native module shims

declare module "expo-sqlite" {
  const x: any
  export = x
}

declare module "expo-stream-audio" {
  export const requestPermission: any
  export const start: any
  export const stop: any
  export const addFrameListener: any
  export const addErrorListener: any
  export type AudioFrameEvent = { pcmBase64: string }
}

declare module "expo-file-system" {
  const x: any
  export = x
}

declare module "expo-file-system/legacy" {
  const x: any
  export = x
}

declare module "expo-sharing" {
  const x: any
  export = x
}

declare module "react-native-view-shot" {
  export const captureRef: any
}

declare module "base64-js" {
  export const toByteArray: any
  export const fromByteArray: any
}
