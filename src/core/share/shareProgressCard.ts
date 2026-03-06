import { captureRef } from "react-native-view-shot"
import * as FileSystem from "expo-file-system/legacy"
import * as Sharing from "expo-sharing"

export async function shareViewAsImage(ref: any, filename = "ntsiniz-progress.png") {
  const uri = await captureRef(ref, { format: "png", quality: 1 })
  const dest = FileSystem.cacheDirectory + filename
  await FileSystem.copyAsync({ from: uri, to: dest })

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(dest)
  }

  return dest
}
