import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

import type { InlineConfig } from 'vite'

const require = createRequire(import.meta.url)
const configDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(configDir, '..')
const srcDir = path.resolve(rootDir, 'src')
const stubDir = path.resolve(srcDir, 'ui', 'testing', 'stubs')
const reactNativeWebDir = path.dirname(require.resolve('react-native-web/package.json'))

function stub(fileName: string) {
  return path.resolve(stubDir, fileName)
}

export function createStorybookViteConfig(): InlineConfig {
  return {
    define: {
      __DEV__: 'true',
      global: 'globalThis',
    },
    resolve: {
      alias: [
        { find: /^@\//, replacement: `${srcDir}/` },
        { find: /^react-native$/, replacement: reactNativeWebDir },
        {
          find: 'react-native/Libraries/Utilities/codegenNativeComponent',
          replacement: stub('react-native-codegenNativeComponent.ts'),
        },
        {
          find: 'react-native-web/Libraries/Utilities/codegenNativeComponent',
          replacement: stub('react-native-codegenNativeComponent.ts'),
        },
        { find: 'react-native-safe-area-context', replacement: stub('react-native-safe-area-context.tsx') },
        { find: 'react-native-reanimated', replacement: stub('react-native-reanimated.ts') },
        { find: 'react-native-gesture-handler', replacement: stub('react-native-gesture-handler.ts') },
        { find: '@gorhom/bottom-sheet', replacement: stub('gorhom-bottom-sheet.tsx') },
        { find: '@shopify/react-native-skia', replacement: stub('react-native-skia.ts') },
        { find: 'expo-av', replacement: stub('expo-av.ts') },
        { find: 'expo-camera', replacement: stub('expo-camera.tsx') },
        { find: 'expo-document-picker', replacement: stub('expo-document-picker.ts') },
        { find: 'expo-file-system/legacy', replacement: stub('expo-file-system.ts') },
        { find: 'expo-file-system', replacement: stub('expo-file-system.ts') },
        { find: 'expo-sharing', replacement: stub('expo-sharing.ts') },
        { find: 'expo-video-thumbnails', replacement: stub('expo-video-thumbnails.ts') },
        { find: 'ntsiniz-audio-route', replacement: stub('ntsiniz-audio-route.ts') },
        { find: 'ntsiniz-voice-dsp', replacement: stub('ntsiniz-voice-dsp.ts') },
        { find: 'ntsiniz-wav-file-writer', replacement: stub('ntsiniz-wav-file-writer.ts') },
        { find: 'react-native-purchases', replacement: stub('react-native-purchases.ts') },
        { find: 'react-native-view-shot', replacement: stub('react-native-view-shot.tsx') },
      ],
      extensions: ['.web.tsx', '.web.ts', '.tsx', '.ts', '.jsx', '.js', '.json'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-native-web'],
    },
    server: {
      fs: {
        allow: [rootDir],
      },
    },
  }
}