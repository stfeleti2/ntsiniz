import React from 'react'

export const ResizeMode = {
  CONTAIN: 'contain',
  COVER: 'cover',
  STRETCH: 'stretch',
} as const

export const Video = React.forwardRef<any, any>((props, ref) =>
  React.createElement('Video', { ...props, ref }, props.children),
)

class Sound {
  async loadAsync() {}
  async playAsync() {}
  async stopAsync() {}
  async unloadAsync() {}
  setOnPlaybackStatusUpdate() {}
}

export const Audio = {
  Sound,
  setAudioModeAsync: async () => {},
  InterruptionModeIOS: { DoNotMix: 1 },
  InterruptionModeAndroid: { DoNotMix: 1 },
}

export default { Video, Audio, ResizeMode }
