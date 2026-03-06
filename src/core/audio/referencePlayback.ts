import * as FileSystem from 'expo-file-system/legacy'
import { Audio } from 'expo-av'
import { audioSession } from '@/core/audio/session'
import type { Drill } from '@/core/drills/schema'
import { playReferenceForDrill } from '@/core/audio/referenceTones'
import { logger } from '@/core/observability/logger'

type PlayRefOptions = {
  /** Overrides any drill-provided reference/demo uri (used for “practice with my audio”). */
  overrideUri?: string | null
}

async function cacheIfRemote(uri: string): Promise<string> {
  if (!uri.startsWith('http://') && !uri.startsWith('https://')) return uri
  const hash = uri.replace(/[^a-z0-9]+/gi, '_').slice(0, 80)
  const target = `${FileSystem.cacheDirectory}ref_${hash}`
  const info = await FileSystem.getInfoAsync(target)
  if (info.exists) return target
  await FileSystem.downloadAsync(uri, target)
  return target
}

async function playClipOnce(uri: string) {
  await audioSession.enter('playback').catch((e) => logger.warn('audioSession.enter(playback) failed', e))
  const s = new Audio.Sound()
  try {
    await s.loadAsync({ uri }, { shouldPlay: false }, false)
    await s.playAsync()
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('reference_clip_timeout'))
      }, 12_000)
      s.setOnPlaybackStatusUpdate((st: any) => {
        if (!st?.isLoaded) return
        if (st.didJustFinish) {
          clearTimeout(timeout)
          resolve()
        }
      })
    })
  } finally {
    try {
      await s.stopAsync()
    } catch {}
    try {
      await s.unloadAsync()
    } catch {}
    await audioSession.leave('playback').catch((e) => logger.warn('audioSession.leave(playback) failed', e))
  }
}

/**
 * Mandatory pre-roll reference: makes drills feel like lessons.
 * Flow: play guide clip OR synth reference tone, then return.
 */
export async function playMandatoryReference(drill: Drill, opts?: PlayRefOptions) {
  const override = opts?.overrideUri ?? null
  const refUri = override || (drill as any).referenceUri || (drill as any).demoUri || null

  if (refUri) {
    const cached = await cacheIfRemote(refUri)
    await playClipOnce(cached)
    return
  }

  // Fall back to synthesized reference tones (must exist for all drills via pack-doctor).
  await playReferenceForDrill(drill)
}
