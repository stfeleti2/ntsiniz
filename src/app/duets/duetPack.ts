import { fromByteArray, toByteArray } from 'base64-js'
import type { DuetInviteManifestV1 } from '@/core/duets/types'
import { safeJsonParse } from '@/core/utils/safeJson'

// Keep this module app-side: it touches expo-file-system/legacy and friends.

export async function ensureDuetsDir(): Promise<string | null> {
  let FileSystem: any
  try {
    FileSystem = await import('expo-file-system/legacy')
  } catch {
    return null
  }
  const base = FileSystem.documentDirectory
  if (!base) return null
  const dir = `${base}ntsiniz/duets`
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch(() => {})
  return dir
}

export async function getDuetInviteDir(inviteId: string): Promise<string | null> {
  const base = await ensureDuetsDir()
  if (!base) return null
  const dir = `${base}/${inviteId}`
  let FileSystem: any
  try {
    FileSystem = await import('expo-file-system/legacy')
  } catch {
    return null
  }
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch(() => {})
  return dir
}

export async function createDuetInvitePack(params: {
  manifest: DuetInviteManifestV1
  partAUri: string
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
  const base = FileSystem.cacheDirectory
  if (!base) return null
  const outDir = `${base}ntsiniz/duet_packs`
  await FileSystem.makeDirectoryAsync(outDir, { intermediates: true }).catch(() => {})

  const partAName = params.manifest.files.partA
  const partAB64 = await FileSystem.readAsStringAsync(params.partAUri, { encoding: FileSystem.EncodingType.Base64 })

  const zip = new JSZip()
  zip.file('manifest.json', JSON.stringify(params.manifest, null, 2))
  zip.file(partAName, partAB64, { base64: true })

  const bytes: Uint8Array = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' })
  const b64 = fromByteArray(bytes)

  const filename = `ntsiniz_duet_${params.manifest.inviteId}.ntsduet`
  const packUri = `${outDir}/${filename}`
  await FileSystem.writeAsStringAsync(packUri, b64, { encoding: FileSystem.EncodingType.Base64 })
  return { packUri, filename }
}

export async function importDuetInvitePack(params: {
  fileUri: string
}): Promise<{ manifest: DuetInviteManifestV1; storedPartAUri: string } | null> {
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
  const manifest = safeJsonParse(manifestStr, {}) as DuetInviteManifestV1
  if (manifest?.v !== 1 || manifest?.kind !== 'duetInvite') return null

  const partAName = manifest.files.partA
  const partAFile = zip.file(partAName)
  if (!partAFile) return null
  const partAB64 = await partAFile.async('base64')

  const dir = await getDuetInviteDir(manifest.inviteId)
  if (!dir) return null
  const storedPartAUri = `${dir}/${partAName}`
  await FileSystem.writeAsStringAsync(storedPartAUri, partAB64, { encoding: FileSystem.EncodingType.Base64 })

  return { manifest, storedPartAUri }
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