import * as FileSystem from 'expo-file-system/legacy'
import { fileStore } from '@/core/io/fileStore'
import { reconcileTakeFilePaths, upsertTakeFile } from '@/core/storage/takeFilesRepo'
import { logger } from '@/core/observability/logger'

export type TakeRecoveryResult = {
  recovered: number
  recoveredUris: string[]
}

/**
 * If the app is killed mid-save, we may leave `.wav.tmp` files behind.
 * This recovers them by renaming to `.wav` on next launch.
 */
export async function recoverOrphanTakes(): Promise<TakeRecoveryResult> {
  const base = FileSystem.cacheDirectory
  if (!base) return { recovered: 0, recoveredUris: [] }
  const dir = `${base}ntsiniz/takes`

  const info = await FileSystem.getInfoAsync(dir)
  if (!info.exists) return { recovered: 0, recoveredUris: [] }

  const files = await FileSystem.readDirectoryAsync(dir)
  const tmps = files.filter((f: string) => f.endsWith('.wav.tmp'))
  if (!tmps.length) return { recovered: 0, recoveredUris: [] }

  const recoveredUris: string[] = []
  const reconciles: { from: string; to: string }[] = []
  for (const f of tmps) {
    const tmpUri = `${dir}/${f}`
    const finalUri = `${dir}/${f.replace(/\.tmp$/, '')}`
    try {
      // If final already exists, keep it and delete tmp.
      const finalInfo = await FileSystem.getInfoAsync(finalUri)
      if (finalInfo.exists) {
        await fileStore.deleteIfExists(tmpUri)
        continue
      }
      await FileSystem.moveAsync({ from: tmpUri, to: finalUri })
      recoveredUris.push(finalUri)
      reconciles.push({ from: tmpUri, to: finalUri })
      await upsertTakeFile({ path: finalUri, tmpPath: null, status: 'saved', meta: {} }).catch((e: unknown) => logger.warn('take recovery: db upsert failed', { error: e }))
    } catch {
      // If move fails, best-effort delete so we don't repeatedly nag.
      await fileStore.deleteIfExists(tmpUri).catch((e: unknown) => logger.warn('take recovery: tmp delete failed', { error: e }))
    }
  }

  await reconcileTakeFilePaths(reconciles).catch((e: unknown) => logger.warn('take recovery: reconcile paths failed', { error: e }))

  return { recovered: recoveredUris.length, recoveredUris }
}
