import { getPublicLinks } from '@/core/config/links'

/**
 * Single source of truth for share-sheet link copy.
 * Keep it short and stable (works across WhatsApp / iMessage / Instagram).
 */
export function getShareFooter(): string | undefined {
  const { appUrl } = getPublicLinks()
  if (!appUrl) return undefined
  return `Get Ntsiniz: ${appUrl}`
}
