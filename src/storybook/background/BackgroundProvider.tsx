import React, { createContext, useContext, useMemo } from 'react'
import { Background } from '@/design-system/primitives'
import {
  designSystemColors,
  type DesignSystemTheme,
} from '@/design-system/tokens/colors'
import {
  resolveStorybookBackground,
  type BackgroundVariant,
} from '@/design-system/tokens/backgrounds'

type BackgroundContextValue = {
  mode: DesignSystemTheme
  background: BackgroundVariant
  resolvedBackground: string
}

const BackgroundContext = createContext<BackgroundContextValue>({
  mode: 'dark',
  background: 'solid',
  resolvedBackground: designSystemColors.dark.canvas,
})

export function BackgroundProvider({
  mode,
  background,
  children,
}: {
  mode: DesignSystemTheme
  background: BackgroundVariant
  children: React.ReactNode
}) {
  const resolvedBackground = resolveStorybookBackground(mode, background)

  const value = useMemo(
    () => ({ mode, background, resolvedBackground }),
    [mode, background, resolvedBackground],
  )

  return (
    <BackgroundContext.Provider value={value}>
      <Background
        variant={background}
        theme={mode}
        key={`${mode}-${background}`}
        style={{ flex: 1 }}
      >
        {children}
      </Background>
    </BackgroundContext.Provider>
  )
}

export function useBackground() {
  return useContext(BackgroundContext)
}
