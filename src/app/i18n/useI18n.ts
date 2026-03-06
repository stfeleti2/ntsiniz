import { useCallback, useMemo, useState } from 'react'

import { getLocale, setLocale as setCoreLocale, t } from '@/app/i18n'

/**
 * UI hook for i18n.
 *
 * Core i18n is intentionally dependency-free (no React). This hook provides
 * a stable, explicit interface for screens/components.
 */
export function useI18n() {
  const [locale, setLocaleState] = useState(() => getLocale())

  const setLocale = useCallback((next: string) => {
    setCoreLocale(next)
    setLocaleState(getLocale())
  }, [])

  return useMemo(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, setLocale]
  )
}
