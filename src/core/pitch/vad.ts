export type VadDecision = {
  voiced: boolean
  rms: number
}

export function vadFromRms(rms: number, gate: number): VadDecision {
  return { voiced: rms >= gate, rms }
}
