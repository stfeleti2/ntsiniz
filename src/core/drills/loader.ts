import { validatePack, type DrillPack } from "./schema"
import { getLocale } from "@/core/i18n"
import { tryLoadContentJson } from "@/core/content/loadWithManifest"
import { isDrillDisabled, isPackDisabled } from "@/core/config/flags"
import { coreError } from "@/core/util/errors"

export function loadPhase1Pack(): DrillPack {
  const locale = (getLocale() || 'en').split('-')[0]
  const raw =
    tryLoadContentJson<any>(`drills/phase1.${locale}.json`) ??
    tryLoadContentJson<any>("drills/phase1.en.json")

  const pack = validatePack(raw)
  if (isPackDisabled(pack.packId)) {
    coreError('pack_disabled', { packId: pack.packId })
    if (!__DEV__) throw new Error(`Pack disabled: ${pack.packId}`)
  }

  const drills = pack.drills.filter((d) => {
    const disabled = isDrillDisabled(d.id)
    if (disabled) coreError('drill_disabled', { drillId: d.id, packId: pack.packId })
    return !disabled
  })

  return { ...pack, drills }
}

function loadPackById(baseId: string): DrillPack {
  const locale = (getLocale() || 'en').split('-')[0]
  const raw =
    tryLoadContentJson<any>(`drills/${baseId}.${locale}.json`) ??
    tryLoadContentJson<any>(`drills/${baseId}.en.json`)

  const pack = validatePack(raw)
  if (isPackDisabled(pack.packId)) {
    coreError('pack_disabled', { packId: pack.packId })
    if (!__DEV__) throw new Error(`Pack disabled: ${pack.packId}`)
  }
  const drills = pack.drills.filter((d) => {
    const disabled = isDrillDisabled(d.id)
    if (disabled) coreError('drill_disabled', { drillId: d.id, packId: pack.packId })
    return !disabled
  })
  return { ...pack, drills }
}

/**
 * Loads all bundled packs and returns a merged pack (international-ready).
 * Why: content volume is a key moat and improves store conversion.
 */
export function loadAllBundledPacks(): DrillPack {
  const packs = [
    loadPackById('phase1'),
    // New packs (safe fallback to en)
    loadPackById('warmups'),
    loadPackById('agility'),
    loadPackById('phase2'),
  ]

  const drills = packs.flatMap((p) => p.drills)
  return {
    packId: 'bundled_all',
    title: 'All Drills',
    version: 1,
    drills,
  } as any
}
