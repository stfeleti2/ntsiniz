import { getLocale } from '@/core/i18n'
import type { CoachesPack, ProgramsPack } from './types'

type GetBundledContentJson = (filePath: string) => any
let _contentGetter: GetBundledContentJson | null = null

function getBundledContentJson(filePath: string) {
  if (!_contentGetter) {
    // Keep this as runtime require so core-only build does not pull src/content into rootDir.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@/content/contentIndex') as { getBundledContentJson: GetBundledContentJson }
    _contentGetter = mod.getBundledContentJson
  }
  return _contentGetter(filePath)
}

export function loadMarketplaceCoaches(localeOverride?: string): CoachesPack {
  const locale = (localeOverride ?? getLocale() ?? 'en').split('-')[0]
  const raw = getBundledContentJson(`marketplace/coaches.${locale}.json`) ?? getBundledContentJson('marketplace/coaches.en.json')
  if (!raw || typeof raw !== 'object' || typeof raw.packId !== 'string' || !Array.isArray(raw.coaches)) throw new Error('Invalid coaches pack')
  const pack = raw as CoachesPack
  // Featured first.
  pack.coaches = [...pack.coaches].sort((a: any, b: any) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
  return pack
}

export function loadMarketplacePrograms(localeOverride?: string): ProgramsPack {
  const locale = (localeOverride ?? getLocale() ?? 'en').split('-')[0]
  const raw = getBundledContentJson(`marketplace/programs.${locale}.json`) ?? getBundledContentJson('marketplace/programs.en.json')
  if (!raw || typeof raw !== 'object' || typeof raw.packId !== 'string' || !Array.isArray(raw.programs)) throw new Error('Invalid programs pack')
  const pack = raw as ProgramsPack
  // Normalize access fields (backward-compatible) + featured first.
  pack.programs = [...pack.programs]
    .map((p: any) => ({ ...p, access: p.access === 'pro' ? 'pro' : 'free', priceLabel: typeof p.priceLabel === 'string' ? p.priceLabel : undefined }))
    .sort((a: any, b: any) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
  return pack
}
