export type RangeBand = { low: number | null; high: number | null }

export const RANGE_LADDER_TOP_TO_BOTTOM = ['Highest', 'Soprano', 'Mezzo', 'Alto', 'Tenor', 'Baritone', 'Bass', 'Lowest'] as const
export const RANGE_LADDER_BOTTOM_TO_TOP = ['Lowest', 'Bass', 'Baritone', 'Tenor', 'Alto', 'Mezzo', 'Soprano', 'Highest'] as const

export function likelyZoneFromBand(band: RangeBand): string {
  if (band.low == null || band.high == null) return 'Alto'
  return likelyZoneFromMidi((band.low + band.high) / 2)
}

export function likelyZoneFromMidi(centerMidi: number): string {
  if (!Number.isFinite(centerMidi)) return 'Alto'
  if (centerMidi < 47) return 'Bass'
  if (centerMidi < 52) return 'Baritone'
  if (centerMidi < 57) return 'Tenor'
  if (centerMidi < 62) return 'Alto'
  if (centerMidi < 66) return 'Mezzo'
  return 'Soprano'
}

