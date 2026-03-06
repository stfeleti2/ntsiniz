import type { CompetitionsPack } from './types'
import { getLocale } from '@/core/i18n'
import { tryLoadContentJson } from '@/core/content/loadWithManifest'
import { isCompetitionDisabled, isPackDisabled } from '@/core/config/flags'
import { coreError } from '@/core/util/errors'

export function loadCompetitionsPack(): CompetitionsPack {
  const locale = (getLocale() || 'en').split('-')[0]
  const raw =
    tryLoadContentJson<any>(`competitions/phase1.${locale}.json`) ??
    tryLoadContentJson<any>('competitions/phase1.en.json')
  const pack = raw as CompetitionsPack
  if (!pack?.packId) {
    coreError('competitions_pack_invalid', { locale })
    if (!__DEV__) throw new Error('Invalid competitions pack')
    return pack
  }
  if (isPackDisabled(pack.packId)) {
    coreError('pack_disabled', { packId: pack.packId })
    if (!__DEV__) throw new Error(`Pack disabled: ${pack.packId}`)
  }

  // Rollback semantics: allow remote kill-switch of specific competitions.
  if (Array.isArray(pack.seasons)) {
    pack.seasons = pack.seasons
      .map((s) => ({
        ...s,
        competitions: Array.isArray(s.competitions)
          ? s.competitions.filter((c) => {
              const id = String((c as any)?.id ?? '')
              if (!id) return false
              if (isCompetitionDisabled(id)) {
                coreError('competition_disabled', { competitionId: id })
                return __DEV__
              }
              return true
            })
          : [],
      }))
      .filter((s) => (s.competitions?.length ?? 0) > 0)
  }

  return pack
}
