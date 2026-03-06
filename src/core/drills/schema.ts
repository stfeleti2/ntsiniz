export type DrillType = "match_note" | "sustain" | "slide" | "interval" | "melody_echo"

export type NoteTarget = {
  note: string
  hz?: number
}

export type Drill = {
  id: string
  title: string
  type: DrillType
  level: number
  /** Optional demo audio clip (local asset or remote URL) */
  demoUri?: string
  /** Mandatory-reference override clip (preferred over demo). */
  referenceUri?: string
  tuneWindowCents: number
  holdMs: number
  countdownMs: number
  target?: NoteTarget
  from?: NoteTarget
  to?: NoteTarget
  intervalSemitones?: number
  melody?: NoteTarget[]
}

export type DrillPack = {
  packId: string
  language: string
  drills: Drill[]
}

const TYPES: DrillType[] = ["match_note", "sustain", "slide", "interval", "melody_echo"]

export function validatePack(raw: any): DrillPack {
  if (!raw || typeof raw !== "object") throw new Error("Invalid drill pack")
  if (typeof raw.packId !== "string" || typeof raw.language !== "string" || !Array.isArray(raw.drills)) {
    throw new Error("Invalid drill pack")
  }

  const drills: Drill[] = raw.drills.map((d: any) => validateDrill(d))
  return { packId: raw.packId, language: raw.language, drills }
}

function validateDrill(d: any): Drill {
  if (!d || typeof d !== "object") throw new Error("Invalid drill")
  if (typeof d.id !== "string" || typeof d.title !== "string") throw new Error("Invalid drill")
  if (!TYPES.includes(d.type)) throw new Error("Invalid drill type")

  return {
    id: d.id,
    title: d.title,
    type: d.type,
    level: typeof d.level === "number" ? d.level : 1,
    demoUri: typeof d.demoUri === 'string' && d.demoUri.length ? d.demoUri : undefined,
    referenceUri: typeof d.referenceUri === 'string' && d.referenceUri.length ? d.referenceUri : undefined,
    tuneWindowCents: typeof d.tuneWindowCents === "number" ? d.tuneWindowCents : 25,
    holdMs: typeof d.holdMs === "number" ? d.holdMs : 1200,
    countdownMs: typeof d.countdownMs === "number" ? d.countdownMs : 800,
    target: d.target && typeof d.target.note === "string" ? d.target : undefined,
    from: d.from && typeof d.from.note === "string" ? d.from : undefined,
    to: d.to && typeof d.to.note === "string" ? d.to : undefined,
    intervalSemitones: typeof d.intervalSemitones === "number" ? d.intervalSemitones : undefined,
    melody: Array.isArray(d.melody) ? d.melody.filter((n: any) => n && typeof n.note === "string") : undefined,
  }
}
