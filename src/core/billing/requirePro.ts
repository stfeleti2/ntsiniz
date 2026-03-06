import { hasPro } from './entitlementsRepo'

type RequireProArgs = {
  navigation: any
  reason: string
  onSuccess: () => void
}

/**
 * Standard premium gate.
 * - If user is Pro, runs onSuccess.
 * - Otherwise navigates to Paywall with a contextual reason.
 */
export async function requirePro({ navigation, reason, onSuccess }: RequireProArgs) {
  const pro = await hasPro().catch(() => false)
  if (pro) {
    onSuccess()
    return
  }
  navigation.navigate('Paywall', { reason })
}
