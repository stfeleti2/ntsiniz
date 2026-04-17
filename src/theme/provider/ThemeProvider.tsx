import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useColorScheme } from 'react-native'
import { buildTheme, theme as defaultTheme, type MotionPreset, type Theme, type ThemeMode } from './theme'

type ThemeControls = {
  mode: ThemeMode
  setMode: (next: ThemeMode) => void
  effectiveMode: Exclude<ThemeMode, 'system'>
  motionPreset: MotionPreset
  setMotionPreset: (next: MotionPreset) => void
  reducedMotion: boolean
  setReducedMotion: (next: boolean) => void
}

type ThemeContextValue = {
  theme: Theme
  controls: ThemeControls
}

const defaultControls: ThemeControls = {
  mode: 'dark',
  setMode: () => {},
  effectiveMode: 'dark',
  motionPreset: 'normal',
  setMotionPreset: () => {},
  reducedMotion: false,
  setReducedMotion: () => {},
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: defaultTheme,
  controls: defaultControls,
})

export function ThemeProvider({
  theme,
  children,
  mode: modeProp,
  motionPreset: motionPresetProp,
  reducedMotion: reducedMotionProp,
}: {
  theme?: Theme
  children: React.ReactNode
  mode?: ThemeMode
  motionPreset?: MotionPreset
  reducedMotion?: boolean
}) {
  const deviceScheme = useColorScheme()
  const [mode, setMode] = useState<ThemeMode>(modeProp ?? 'dark')
  const [motionPreset, setMotionPreset] = useState<MotionPreset>(motionPresetProp ?? 'normal')
  const [reducedMotion, setReducedMotion] = useState<boolean>(reducedMotionProp ?? false)

  useEffect(() => {
    if (modeProp) setMode(modeProp)
  }, [modeProp])

  useEffect(() => {
    if (motionPresetProp) setMotionPreset(motionPresetProp)
  }, [motionPresetProp])

  useEffect(() => {
    if (typeof reducedMotionProp === 'boolean') setReducedMotion(reducedMotionProp)
  }, [reducedMotionProp])

  const effectiveMode: Exclude<ThemeMode, 'system'> =
    (mode === 'system' ? (deviceScheme === 'light' ? 'light' : 'dark') : mode) ?? 'dark'

  const resolvedTheme = useMemo(() => {
    if (theme) return theme
    return buildTheme({
      mode: effectiveMode,
      motionPreset,
      reducedMotion,
    })
  }, [theme, effectiveMode, motionPreset, reducedMotion])

  const controls = useMemo<ThemeControls>(
    () => ({
      mode,
      setMode,
      effectiveMode,
      motionPreset,
      setMotionPreset,
      reducedMotion,
      setReducedMotion,
    }),
    [mode, effectiveMode, motionPreset, reducedMotion],
  )

  const value = useMemo(
    () => ({
      theme: resolvedTheme,
      controls,
    }),
    [resolvedTheme, controls],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext).theme
}

export function useThemeControls() {
  return useContext(ThemeContext).controls
}
