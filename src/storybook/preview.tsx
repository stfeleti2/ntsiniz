import type { Preview } from '@storybook/react-native'
import { withAppProviders } from './decorators'

const preview: Preview = {
  decorators: [withAppProviders],
  globalTypes: {
    themeMode: {
      name: 'Theme',
      defaultValue: 'dark',
      toolbar: {
        icon: 'paintbrush',
        items: ['dark', 'light', 'system'],
      },
    },
    motionPreset: {
      name: 'Motion',
      defaultValue: 'normal',
      toolbar: {
        icon: 'timer',
        items: ['snappy', 'normal', 'calm'],
      },
    },
    reducedMotion: {
      name: 'Reduced Motion',
      defaultValue: 'off',
      toolbar: {
        icon: 'accessibility',
        items: ['off', 'on'],
      },
    },
    locale: {
      name: 'Locale',
      defaultValue: 'en',
      toolbar: {
        icon: 'globe',
        items: ['en', 'zu', 'xh'],
      },
    },
    viewport: {
      name: 'Viewport',
      defaultValue: 'phone-lg',
      toolbar: {
        icon: 'mobile',
        items: ['phone-sm', 'phone-lg', 'tablet'],
      },
    },
  },
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#070911' },
        { name: 'surface', value: '#1B2340' },
        { name: 'light', value: '#F3F6FF' },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
}

export default preview
