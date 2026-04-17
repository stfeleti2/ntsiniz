import React from 'react'
import { View } from 'react-native'
import { ThemeProvider, type MotionPreset, type ThemeMode } from '@/theme/provider'
import {
  designSystemColors,
  type DesignSystemTheme,
} from '@/design-system/tokens/colors'
import {
  storybookBackgroundValues,
  type BackgroundVariant,
  type StorybookBackgroundPreset,
} from '@/design-system/tokens/backgrounds'
import { BackgroundProvider } from './background/BackgroundProvider'
import { setLocale } from '@/app/i18n'
import { MockDataProvider } from './mocks/MockDataProvider'
import type { StoryLocalePreset, StoryViewportPreset } from './types'

type StoryContext = {
  globals?: Record<string, unknown>
}

function coerceMode(value: unknown): ThemeMode {
  if (value === 'light') return value
  return 'dark'
}

const storybookBackgroundPresetByValue = storybookBackgroundValues.reduce<Record<string, StorybookBackgroundPreset>>(
  (acc, item) => {
    acc[item.value.toLowerCase()] = item.name
    return acc
  },
  {},
)

function normalizeBackgroundSelection(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value
  }

  if (value && typeof value === 'object') {
    const selection = value as Record<string, unknown>
    if (typeof selection.name === 'string') {
      return selection.name
    }
    if (typeof selection.value === 'string') {
      return selection.value
    }
  }

  return undefined
}

function resolveStoryBackground(
  value: unknown,
  modeFromThemeToolbar: ThemeMode,
): { mode: DesignSystemTheme; background: BackgroundVariant } {
  const normalizedSelection = normalizeBackgroundSelection(value)?.trim().toLowerCase()
  const preset = (
    normalizedSelection
      ? storybookBackgroundPresetByValue[normalizedSelection] ?? normalizedSelection
      : undefined
  ) as StorybookBackgroundPreset | 'solid' | 'layered' | undefined

  if (preset === 'light') {
    return { mode: 'light', background: 'solid' }
  }
  if (preset === 'dark') {
    return { mode: 'dark', background: 'solid' }
  }
  if (preset === 'neo-light') {
    return { mode: 'light', background: 'layered' }
  }
  if (preset === 'neo-dark') {
    return { mode: 'dark', background: 'layered' }
  }
  if (preset === 'texture') {
    return { mode: modeFromThemeToolbar === 'light' ? 'light' : 'dark', background: 'texture' }
  }
  if (preset === 'layered') {
    return { mode: modeFromThemeToolbar === 'light' ? 'light' : 'dark', background: 'layered' }
  }
  return { mode: modeFromThemeToolbar === 'light' ? 'light' : 'dark', background: 'solid' }
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
  const backgroundSelection = globals.storyBackground ?? globals.backgrounds
  const resolvedBackground = resolveStoryBackground(backgroundSelection, mode)
  const motion = coerceMotion(globals.motionPreset)
  const locale = coerceLocale(globals.locale)
  const reducedMotion = globals.reducedMotion === 'on'
  const resolvedMode: DesignSystemTheme = resolvedBackground.mode
  setLocale(locale)

  return (
    <ThemeProvider mode={mode} motionPreset={motion} reducedMotion={reducedMotion}>
      <BackgroundProvider mode={resolvedMode} background={resolvedBackground.background}>
        <MockDataProvider>
          <View style={{ flex: 1, minHeight: 820, padding: 16 }}>
            <View
              style={{
                flex: 1,
                minHeight: 780,
                padding: 16,
                alignSelf: 'center',
                borderRadius: 24,
                backgroundColor: resolvedMode === 'dark' ? designSystemColors.dark.stageSoft : designSystemColors.light.stageSoft,
                ...viewportStyle(globals.viewport as StoryViewportPreset),
              }}
            >
              <Story />
            </View>
          </View>
        </MockDataProvider>
      </BackgroundProvider>
    </ThemeProvider>
  )
}
