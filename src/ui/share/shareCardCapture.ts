import { captureRef } from 'react-native-view-shot'
import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system/legacy'
import { logger } from '@/core/observability/logger'

export async function shareCapturedCard(ref: any, filename = 'ntsiniz-card.png') {
  let uri: string | null = null
  try {
    uri = await captureRef(ref, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
      fileName: filename,
    })

    const ok = await Sharing.isAvailableAsync().catch((e: unknown) => {
      logger.warn('Sharing.isAvailableAsync failed', { error: e })
      return false
    })
    if (!ok) return

    await Sharing.shareAsync(uri, { dialogTitle: 'Share', mimeType: 'image/png' })
  } finally {
    if (uri) {
      await FileSystem.deleteAsync(uri, { idempotent: true }).catch((e: unknown) => logger.warn('share capture temp cleanup failed', { error: e }))
    }
  }
}
