export type PerformanceTemplate = {
  id: string
  title: string
  subtitle: string
  durationSec: number
  // For now we keep it simple: a template can optionally suggest a drill focus.
  // Future: backing tracks, lyric overlays, camera filters.
  hint?: string
}

export const PERFORMANCE_TEMPLATES: PerformanceTemplate[] = [
  {
    id: 'clip.pitchlock.15',
    title: 'Pitch Lock · 15s',
    subtitle: 'Hold one note cleanly. Keep the needle steady.',
    durationSec: 15,
    hint: 'Aim for stability over volume.',
  },
  {
    id: 'clip.stability.20',
    title: 'Stability · 20s',
    subtitle: 'Sustain + gentle slide. Smooth transitions only.',
    durationSec: 20,
    hint: 'No big jumps—glide.',
  },
  {
    id: 'clip.agility.15',
    title: 'Agility · 15s',
    subtitle: 'Fast little steps. Keep it accurate.',
    durationSec: 15,
    hint: 'Small, clean moves beat messy speed.',
  },
]

export function getPerformanceTemplate(id?: string | null): PerformanceTemplate {
  const found = PERFORMANCE_TEMPLATES.find((t) => t.id === id)
  return found ?? PERFORMANCE_TEMPLATES[0]
}
