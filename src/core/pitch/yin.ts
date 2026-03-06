export type YinResult = {
  freqHz: number | null
  confidence: number // 0..1
}

export type YinWorkspace = {
  diff: Float32Array
  cmnd: Float32Array
}

function ensureWorkspace(ws: YinWorkspace | undefined, size: number): YinWorkspace {
  if (!ws || ws.diff.length < size || ws.cmnd.length < size) {
    return {
      diff: new Float32Array(size),
      cmnd: new Float32Array(size),
    }
  }
  return ws
}

/**
 * Minimal YIN pitch detector (monophonic).
 * Returns frequency + confidence (1 - CMND at tau).
 */
export function yinDetect(
  samples: Float32Array,
  sampleRate: number,
  opts?: {
    minFreq?: number
    maxFreq?: number
    threshold?: number
  },
  workspace?: YinWorkspace,
): YinResult {
  const minFreq = opts?.minFreq ?? 70
  const maxFreq = opts?.maxFreq ?? 900
  const threshold = opts?.threshold ?? 0.12

  // Tau range
  const tauMin = Math.max(2, Math.floor(sampleRate / maxFreq))
  const tauMax = Math.min(samples.length - 2, Math.floor(sampleRate / minFreq))
  if (tauMax <= tauMin + 2) return { freqHz: null, confidence: 0 }

  const size = tauMax + 1
  const ws = ensureWorkspace(workspace, size)
  const diff = ws.diff

  // Difference function d(tau)
  diff.fill(0, 0, size)
  for (let tau = 1; tau <= tauMax; tau++) {
    let sum = 0
    for (let i = 0; i < samples.length - tau; i++) {
      const d = samples[i] - samples[i + tau]
      sum += d * d
    }
    diff[tau] = sum
  }

  // CMND function
  const cmnd = ws.cmnd
  cmnd.fill(0, 0, size)
  cmnd[0] = 1
  let runningSum = 0
  for (let tau = 1; tau <= tauMax; tau++) {
    runningSum += diff[tau]
    cmnd[tau] = diff[tau] * tau / Math.max(1e-12, runningSum)
  }

  // Find first tau under threshold (after tauMin)
  let tauEstimate = -1
  for (let tau = tauMin; tau <= tauMax; tau++) {
    if (cmnd[tau] < threshold) {
      // local minimum search
      while (tau + 1 <= tauMax && cmnd[tau + 1] < cmnd[tau]) tau++
      tauEstimate = tau
      break
    }
  }

  if (tauEstimate === -1) {
    // fallback: global minimum in range
    let bestTau = tauMin
    let bestVal = cmnd[tauMin]
    for (let tau = tauMin + 1; tau <= tauMax; tau++) {
      if (cmnd[tau] < bestVal) {
        bestVal = cmnd[tau]
        bestTau = tau
      }
    }
    tauEstimate = bestTau
  }

  // Parabolic interpolation around tauEstimate
  const tau0 = Math.max(tauMin, tauEstimate - 1)
  const tau1 = tauEstimate
  const tau2 = Math.min(tauMax, tauEstimate + 1)
  const s0 = cmnd[tau0]
  const s1 = cmnd[tau1]
  const s2 = cmnd[tau2]

  let betterTau = tau1
  const denom = (2 * s1 - s2 - s0)
  if (Math.abs(denom) > 1e-12) {
    betterTau = tau1 + (s2 - s0) / (2 * denom)
  }

  const freq = sampleRate / betterTau
  if (!Number.isFinite(freq) || freq < minFreq || freq > maxFreq) return { freqHz: null, confidence: 0 }

  const conf = Math.max(0, Math.min(1, 1 - cmnd[tauEstimate]))
  return { freqHz: freq, confidence: conf }
}
