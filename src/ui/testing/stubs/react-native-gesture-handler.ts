import React from 'react'

export const Gesture = {
  Pan() {
    return {
      onBegin() {
        return this
      },
      onUpdate() {
        return this
      },
      onEnd() {
        return this
      },
    }
  },
}

export function GestureDetector(props: any) {
  return React.createElement('GestureDetector', props, props?.children)
}

