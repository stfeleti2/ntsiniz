import { validateCurriculumPack, type Curriculum, type CurriculumPack } from './schema'
import { getLocale } from '@/core/i18n'
import { tryLoadContentJson } from '@/core/content/loadWithManifest'
import { isDrillDisabled, isPackDisabled } from '@/core/config/flags'
import { coreError } from '@/core/util/errors'

export type CurriculumId = 'phase1' | 'pro_regimen' | 'pro_regimen12'

export type TrainingTrack = 'beginner' | 'intermediate' | 'advanced'

function loadPack(pathBase: string): CurriculumPack {
  const locale = (getLocale() || 'en').split('-')[0]
  const raw =
    tryLoadContentJson<any>(`${pathBase}.${locale}.json`) ??
    tryLoadContentJson<any>(`${pathBase}.en.json`)

  const pack = validateCurriculumPack(raw)

  if (isPackDisabled(pack.packId)) {
    coreError('pack_disabled', { packId: pack.packId })
    if (!__DEV__) throw new Error(`Pack disabled: ${pack.packId}`)
  }

  const curriculum = {
    ...pack.curriculum,
    days: pack.curriculum.days.map((d) => {
      const drillIds = d.drillIds.filter((id) => {
        const disabled = isDrillDisabled(id)
        if (disabled) coreError('curriculum_drill_disabled', { drillId: id, dayId: d.id, packId: pack.packId })
        return !disabled
      })
      return { ...d, drillIds }
    }),
  }

  return { ...pack, curriculum }
}

export function loadPhase1Curriculum(): Curriculum {
  return loadPack('curriculum/phase1').curriculum
}

export function loadProRegimenCurriculum(): Curriculum {
  return loadPack('curriculum/pro_regimen').curriculum
}

export function loadProRegimen12Curriculum(track: TrainingTrack): Curriculum {
  return loadPack(`curriculum/pro_regimen12_${track}`).curriculum
}

export function loadCurriculum(id: CurriculumId, track: TrainingTrack = 'beginner'): Curriculum {
  switch (id) {
    case 'pro_regimen':
      return loadProRegimenCurriculum()
    case 'pro_regimen12':
      return loadProRegimen12Curriculum(track)
    case 'phase1':
    default:
      return loadPhase1Curriculum()
  }
}
