import * as FileSystem from 'expo-file-system/legacy'

type FsEncoding = 'utf8' | 'base64'

export type WriteTextOpts = { encoding?: FsEncoding }
export type CopyOpts = { overwrite?: boolean }

/**
 * Centralized file IO. Keep base64 reads/writes out of UI code where possible.
 * This module is intentionally small (no extra deps).
 */
export const fileStore = {
  async ensureDir(dirUri: string): Promise<void> {
    const info = await FileSystem.getInfoAsync(dirUri)
    if (info.exists) return
    await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true })
  },

  async writeText(uri: string, text: string, opts: WriteTextOpts = {}): Promise<void> {
    await FileSystem.writeAsStringAsync(uri, text, { encoding: (opts.encoding ?? 'utf8') as any })
  },

  async readText(uri: string, opts: { encoding?: FsEncoding } = {}): Promise<string> {
    return await FileSystem.readAsStringAsync(uri, { encoding: (opts.encoding ?? 'utf8') as any })
  },

  async writeBase64(uri: string, base64: string): Promise<void> {
    await FileSystem.writeAsStringAsync(uri, base64, { encoding: 'base64' as any })
  },

  async readBase64(uri: string): Promise<string> {
    return await FileSystem.readAsStringAsync(uri, { encoding: 'base64' as any })
  },

  async tryCopy(src: string, dst: string, opts: CopyOpts = {}): Promise<boolean> {
    try {
      const dstInfo = await FileSystem.getInfoAsync(dst)
      if (dstInfo.exists && !opts.overwrite) return true
      await FileSystem.copyAsync({ from: src, to: dst })
      return true
    } catch {
      return false
    }
  },

  async copyWithBase64Fallback(src: string, dst: string): Promise<void> {
    const ok = await this.tryCopy(src, dst, { overwrite: true })
    if (ok) return
    const b64 = await this.readBase64(src)
    await this.writeBase64(dst, b64)
  },

  async deleteIfExists(uri: string): Promise<void> {
    try {
      const info = await FileSystem.getInfoAsync(uri)
      if (info.exists) await FileSystem.deleteAsync(uri, { idempotent: true })
    } catch {
      // noop
    }
  },
}
