import type { Drill } from "./schema"

export function describeDrill(drill: Drill): string {
  switch (drill.type) {
    case "match_note":
      return "Match the target note. Lock in quickly and stay centered."
    case "sustain":
      return `Hold the note steady for ${Math.round(drill.holdMs / 1000)}s. Keep airflow smooth.`
    case "slide":
      return "Start on the first note, then glide smoothly to the second without wobble."
    case "interval":
      return "Hear the jump, then sing it. Aim for the correct direction and distance."
    case "melody_echo":
      return "Listen to the short melody, then echo it back step by step."
    default:
      return "Sing the target as clean and steady as you can."
  }
}
