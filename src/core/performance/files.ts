import * as FileSystem from 'expo-file-system/legacy'
import { fileStore } from '@/core/io/fileStore'

export function clipsDir() {
  return `${FileSystem.documentDirectory ?? ''}clips/`
}

export async function ensureClipsDir() {
  const dir = clipsDir()
  if (!dir) throw new Error('Missing documentDirectory')
  const info = await FileSystem.getInfoAsync(dir)
  if (!info.exists) await FileSystem.makeDirectoryAsync(dir, { intermediates: true })
  return dir
}

export async function persistVideoTemp(tempUri: string, clipId: string) {
  const dir = await ensureClipsDir()
  const dst = `${dir}${clipId}.mp4`
  // Move if possible; if move fails (cross-device), fallback to copy.
  try {
    await FileSystem.moveAsync({ from: tempUri, to: dst })
  } catch {
    await FileSystem.copyAsync({ from: tempUri, to: dst })
    try {
      await FileSystem.deleteAsync(tempUri, { idempotent: true })
    } catch {}
  }
  return dst
}

export async function persistImageTemp(tempUri: string, clipId: string) {
  const dir = await ensureClipsDir()
  const dst = `${dir}${clipId}.jpg`
  try {
    await FileSystem.moveAsync({ from: tempUri, to: dst })
  } catch {
    await FileSystem.copyAsync({ from: tempUri, to: dst })
    try {
      await FileSystem.deleteAsync(tempUri, { idempotent: true })
    } catch {}
  }
  return dst
}

export async function persistClipBase64(params: { clipId: string; base64: string; ext: 'mp4' | 'wav' | 'm4a' }) {
  const dir = await ensureClipsDir()
  const dst = `${dir}${params.clipId}.${params.ext}`
  await fileStore.writeBase64(dst, params.base64)
  return dst
}
