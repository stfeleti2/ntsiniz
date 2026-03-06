export function clamp01(x: number) {
  return Math.max(0, Math.min(1, x))
}

/**
 * Convert a pointer x (in pixels) into progress (0..1), respecting horizontal padding.
 */
export function progressFromX(x: number, width: number, paddingX: number) {
  const w = Math.max(1, width)
  const pad = Math.max(0, paddingX)
  const usable = Math.max(1, w - pad * 2)
  return clamp01((x - pad) / usable)
}

/**
 * Convert progress (0..1) into x coordinate (in pixels), respecting horizontal padding.
 */
export function xFromProgress(progress: number, width: number, paddingX: number) {
  const w = Math.max(1, width)
  const p = clamp01(progress)
  const pad = Math.max(0, paddingX)
  const usable = Math.max(1, w - pad * 2)
  return pad + p * usable
}
