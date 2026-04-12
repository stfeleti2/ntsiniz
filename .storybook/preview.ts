import basePreview from '../src/storybook/preview'

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