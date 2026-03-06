import { fromByteArray, toByteArray } from 'base64-js'
import { safeJsonParse } from '@/core/utils/safeJson'

// Keep this module app-side: it touches expo-file-system/legacy and friends.

export type FeedbackPackManifestV1 = {
  v: 1
  kind: 'feedbackPack'
  createdAt: number
  payload: {
    coach: { id: string; name: string }
    student: { id: string; name: string }
    message: string
    // Optional: embed a clip from the student device
    clip?: {
      filename: string
      mimeType: string
      durationMs: number
      score: number
      title: string
      templateId?: string
    }
  }
}

export async function ensureFeedbackPacksDir(): Promise<string | null> {
  let FileSystem: any
  try {
    FileSystem = await import('expo-file-system/legacy')
  } catch {
    return null
  }
  const base = FileSystem.cacheDirectory
  if (!base) return null
  const dir = `${base}ntsiniz/feedback_packs`
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch(() => {})
  return dir
}

export async function createFeedbackPack(params: {
  manifest: FeedbackPackManifestV1
  clipUri?: string | null
}): Promise<{ packUri: string; filename: string } | null> {
  let FileSystem: any
  try {
    FileSystem = await import('expo-file-system/legacy')
  } catch {
    return null
  }
  let JSZip: any
  try {
    JSZip = (await import('jszip')).default
  } catch {
    return null
  }

  const outDir = await ensureFeedbackPacksDir()
  if (!outDir) return null

  const zip = new JSZip()
  zip.file('manifest.json', JSON.stringify(params.manifest, null, 2))

  if (params.manifest.payload.clip && params.clipUri) {
    const clipB64 = await FileSystem.readAsStringAsync(params.clipUri, { encoding: FileSystem.EncodingType.Base64 })
    zip.file(params.manifest.payload.clip.filename, clipB64, { base64: true })
  }

  const bytes: Uint8Array = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' })
  const b64 = fromByteArray(bytes)

  const filename = `ntsiniz_feedback_${params.manifest.createdAt}.ntsfbk`
  const packUri = `${outDir}/${filename}`
  await FileSystem.writeAsStringAsync(packUri, b64, { encoding: FileSystem.EncodingType.Base64 })
  return { packUri, filename }
}

export async function importFeedbackPack(params: {
  fileUri: string
}): Promise<{ manifest: FeedbackPackManifestV1; clipFileB64?: string | null } | null> {
  let FileSystem: any
  try {
    FileSystem = await import('expo-file-system/legacy')
  } catch {
    return null
  }
  let JSZip: any
  try {
    JSZip = (await import('jszip')).default
  } catch {
    return null
  }

  const b64 = await FileSystem.readAsStringAsync(params.fileUri, { encoding: FileSystem.EncodingType.Base64 })
  const bytes = toByteArray(b64)
  const zip = await JSZip.loadAsync(bytes)

  const manifestStr = await zip.file('manifest.json')?.async('string')
  if (!manifestStr) return null
  const manifest = safeJsonParse(manifestStr, {}) as FeedbackPackManifestV1
  if (manifest?.v !== 1 || manifest?.kind !== 'feedbackPack') return null

  let clipFileB64: string | null = null
  if (manifest.payload.clip?.filename) {
    const f = zip.file(manifest.payload.clip.filename)
    if (f) clipFileB64 = await f.async('base64')
  }

  return { manifest, clipFileB64 }
}

export async function shareFile(uri: string, mimeType?: string) {
  let Sharing: any
  try {
    Sharing = await import('expo-sharing')
  } catch {
    return
  }
  try {
    const ok = await Sharing.isAvailableAsync()
    if (!ok) return
    await Sharing.shareAsync(uri, mimeType ? { mimeType } : undefined)
  } catch {
    // ignore
  }
}