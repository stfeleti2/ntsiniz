import React, { createContext, useContext, useMemo } from 'react'
import { theme as defaultTheme, Theme } from './theme'

const ThemeContext = createContext<Theme>(defaultTheme)

export function ThemeProvider({ theme, children }: { theme?: Theme; children: React.ReactNode }) {
  const value = useMemo(() => theme ?? defaultTheme, [theme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
