import type { VoiceProfile } from "../storage/profileRepo"

export function generateTip(p: VoiceProfile) {
  const tips: string[] = []

  if (p.voicedRatio < 0.45) {
    tips.push("Use a cleaner tone: take a quick breath and start the note gently (avoid airy starts).")
  }

  if (Math.abs(p.biasCents) > 18) {
    tips.push(p.biasCents > 0 ? "You tend to sing sharp. Start slightly lower, then settle into the center." : "You tend to sing flat. Think ‘lift’ the note slightly—aim a bit higher than you feel.")
  }

  if (p.wobbleCents > 18) {
    tips.push("Stability drill: hold the note with steady airflow. Imagine ‘laser voice’, not ‘wavy voice’. ")
  }

  if (Math.abs(p.driftCentsPerSec) > 4) {
    tips.push("You drift over time. Keep airflow consistent—don’t let the note sag at the end of the hold.")
  }

  if (p.overshootRate > 0.2) {
    tips.push("You overshoot then correct. Slide into the note slower and stop earlier—don’t chase it.")
  }

  if (!tips.length) {
    tips.push("Nice control. Next session: tighten the window and aim for a smoother, steadier hold.")
  }

  return tips[0]
}
