import { Audio } from 'expo-av'

let current: Audio.Sound | null = null

export async function stopVoiceDemo() {
  if (!current) return
  try {
    await current.stopAsync()
  } catch {
    // ignore
  }
  try {
    await current.unloadAsync()
  } catch {
    // ignore
  }
  current = null
}

export async function playVoiceDemo(asset: number, opts?: { volume?: number; onDone?: () => void }) {
  await stopVoiceDemo()
  const { sound } = await Audio.Sound.createAsync(asset, { shouldPlay: true, volume: opts?.volume ?? 0.95 })
  current = sound
  sound.setOnPlaybackStatusUpdate((st) => {
    if (!st.isLoaded) return
    if (st.didJustFinish) {
      void stopVoiceDemo()
      opts?.onDone?.()
    }
  })
}
