import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

/**
 * Dev-only module gating.
 *
 * Goals:
 * - Let us ship stable modules in production.
 * - Let us test experimental modules/patterns behind toggles in Component Lab.
 * - No persistence for now (keeps dependency surface minimal).
 */

export type DevModuleKey =
  | 'module.home.hero'
  | 'module.home.recommended'
  | 'module.journey.header'
  | 'module.journey.nextUp'
  | 'module.journey.sessionRow'
  | 'module.session.summary'
  | 'module.results.score'
  | 'module.results.share'
  | 'pattern.playbackOverlay.live'

type DevModulesState = Record<DevModuleKey, boolean>

const DEFAULTS: DevModulesState = {
  'module.home.hero': true,
  'module.home.recommended': true,
  'module.journey.header': true,
  'module.journey.nextUp': true,
  'module.journey.sessionRow': true,
  'module.session.summary': true,
  'module.results.score': true,
  'module.results.share': true,
  'pattern.playbackOverlay.live': false,
}

// Production behavior: stable modules ON by default.
const PROD_DEFAULTS: DevModulesState = {
  'module.home.hero': true,
  'module.home.recommended': true,
  'module.journey.header': true,
  'module.journey.nextUp': true,
  'module.journey.sessionRow': true,
  'module.session.summary': true,
  'module.results.score': true,
  'module.results.share': true,
  // Real take playback is not implemented in storage yet, keep off in prod.
  'pattern.playbackOverlay.live': false,
}

type DevModulesContextValue = {
  enabled: DevModulesState
  setEnabled: (key: DevModuleKey, value: boolean) => void
  reset: () => void
}

const DevModulesContext = createContext<DevModulesContextValue | null>(null)

export function DevModulesProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabledState] = useState<DevModulesState>(DEFAULTS)

  const setEnabled = useCallback((key: DevModuleKey, value: boolean) => {
    setEnabledState((prev) => ({ ...prev, [key]: value }))
  }, [])

  const reset = useCallback(() => setEnabledState(DEFAULTS), [])

  const value = useMemo(() => ({ enabled, setEnabled, reset }), [enabled, reset, setEnabled])

  return <DevModulesContext.Provider value={value}>{children}</DevModulesContext.Provider>
}

export function useDevModules() {
  const ctx = useContext(DevModulesContext)
  if (!ctx) {
    // In production builds (or if provider is missing), behave as defaults.
    return {
      enabled: DEFAULTS,
      setEnabled: () => {},
      reset: () => {},
    } as DevModulesContextValue
  }
  return ctx
}

export function useDevModuleEnabled(key: DevModuleKey): boolean {
  const { enabled } = useDevModules()
  return __DEV__ ? !!enabled[key] : false
}

/**
 * Use this for modules that should ship in production.
 * In dev, you can toggle them in Component Lab.
 */
export function useModuleEnabled(key: DevModuleKey): boolean {
  const { enabled } = useDevModules()
  return __DEV__ ? !!enabled[key] : !!PROD_DEFAULTS[key]
}
