import React from 'react'
import { View } from 'react-native'
import { ThemeProvider, type MotionPreset, type ThemeMode } from '@/theme/provider'
import { setLocale } from '@/app/i18n'
import { MockDataProvider } from './mocks/MockDataProvider'
import type { StoryLocalePreset, StoryViewportPreset } from './types'

type StoryContext = {
  globals?: Record<string, unknown>
}

function coerceMode(value: unknown): ThemeMode {
  if (value === 'light' || value === 'system') return value
  return 'dark'
}

function coerceMotion(value: unknown): MotionPreset {
  if (value === 'snappy' || value === 'calm') return value
  return 'normal'
}

function coerceLocale(value: unknown): StoryLocalePreset {
  if (value === 'zu' || value === 'xh') return value
  return 'en'
}

function viewportStyle(value: unknown): { width: number } {
  if (value === 'phone-sm') return { width: 320 }
  if (value === 'tablet') return { width: 768 }
  return { width: 390 }
}

export function withAppProviders(Story: React.ComponentType, context?: StoryContext) {
  const globals = context?.globals ?? {}
  const mode = coerceMode(globals.themeMode)
  const motion = coerceMotion(globals.motionPreset)
  const locale = coerceLocale(globals.locale)
  const reducedMotion = globals.reducedMotion === 'on'
  setLocale(locale)

  return (
    <ThemeProvider mode={mode} motionPreset={motion} reducedMotion={reducedMotion}>
      <MockDataProvider>
        <View style={{ flex: 1, minHeight: 780, padding: 16, alignSelf: 'center', ...viewportStyle(globals.viewport as StoryViewportPreset) }}>
          <Story />
        </View>
      </MockDataProvider>
    </ThemeProvider>
  )
}
