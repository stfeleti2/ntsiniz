import React from 'react'
import * as ReactDOM from 'react-dom'
import basePreview from '../src/storybook/preview'

if (typeof window !== 'undefined') {
  ;(window as Record<string, unknown>).React = React
  ;(window as Record<string, unknown>).ReactDOM = ReactDOM
}

const preview = {
  ...basePreview,
  parameters: {
    ...basePreview.parameters,
    layout: 'fullscreen',
    controls: {
      ...basePreview.parameters?.controls,
      expanded: true,
    },
  },
}

export default preview