import * as FileSystem from "expo-file-system/legacy"
import * as Sharing from "expo-sharing"
import { listSessionAggregates } from "../storage/sessionsRepo"
import { listAttemptsInRange } from "../storage/attemptsRepo"

import { buildTrainingCsv } from "./trainingCsv"

export async function exportTrainingCsv(params?: { days?: number; share?: boolean }) {
  const days = params?.days ?? 180
  const share = params?.share ?? true
  const end = Date.now()
  const start = end - days * 24 * 60 * 60 * 1000

  const aggs = await listSessionAggregates(500)
  const attempts = await listAttemptsInRange(start, end)

  const csv = buildTrainingCsv({ sessions: aggs, attempts })
  const fileUri = `${FileSystem.cacheDirectory}ntsiniz-training-${days}d.csv`
  await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 })

  if (share && (await Sharing.isAvailableAsync())) {
    await Sharing.shareAsync(fileUri, { mimeType: "text/csv", dialogTitle: "Export Ntsiniz training CSV" })
  }

  return fileUri
}
