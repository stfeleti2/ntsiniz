import { loadAllBundledPacks } from '@/core/drills/loader'
import type { Drill } from '@/core/drills/schema'
import { enableExtendedPackFamilies } from '@/core/config/flags'
import { loadGuidedJourneyProgram } from './loader'
import type { GuidedJourneyDrill, PackDrillFamily } from './types'

type HostDrillType = Drill['type']

export type HostMappedPackDrill = {
  packDrillId: string
  hostDrillId: string
  family: PackDrillFamily
  title: string
  supported: boolean
  instructions: string
}

const familyToHostType: Record<PackDrillFamily, HostDrillType> = {
  match_note: 'match_note',
  sustain_hold: 'sustain',
  pitch_slide: 'slide',
  interval_jump: 'interval',
  melody_echo: 'melody_echo',
  confidence_rep: 'match_note',
  phrase_sing: 'melody_echo',
  dynamic_control: 'sustain',
  vowel_shape: 'sustain',
  vibrato_control: 'sustain',
  register_bridge: 'slide',
  performance_run: 'melody_echo',
}

export function mapPackLessonToHostDrills(lessonId: string, routeId?: string | null): HostMappedPackDrill[] {
  const program = loadGuidedJourneyProgram()
  const hostPack = loadAllBundledPacks()
  const lesson = program.lessonsById[lessonId]
  if (!lesson) return []

  const lessonDrills = lesson.drillIds.map((id) => program.drillsById[id]).filter(Boolean)
  const drills = routeId ? lessonDrills.filter((drill) => drill.routeId === routeId) : lessonDrills
  const source = drills.length ? drills : lessonDrills
  const used = new Set<string>()
  return source
    .map((drill, index) => mapSinglePackDrill(drill, hostPack.drills, used, index))
    .filter(Boolean) as HostMappedPackDrill[]
}

function mapSinglePackDrill(packDrill: GuidedJourneyDrill, hostDrills: Drill[], used: Set<string>, index: number): HostMappedPackDrill | null {
  const desiredType = familyToHostType[packDrill.drillType]
  const pool = hostDrills
    .filter((drill) => drill.type === desiredType)
    .sort((a, b) => a.level - b.level || a.title.localeCompare(b.title))

  if (!pool.length) return null

  const preferred = pool.find((drill) => !used.has(drill.id))
  const fallback = pool[index % pool.length]
  const picked = preferred ?? fallback
  used.add(picked.id)

  const supported =
    enableExtendedPackFamilies() ||
    ['match_note', 'sustain_hold', 'pitch_slide', 'interval_jump', 'melody_echo', 'confidence_rep'].includes(packDrill.drillType)

  return {
    packDrillId: packDrill.id,
    hostDrillId: picked.id,
    family: packDrill.drillType,
    title: packDrill.title,
    supported,
    instructions: packDrill.instructions,
  }
}
