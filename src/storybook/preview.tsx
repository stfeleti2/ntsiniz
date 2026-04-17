import type { Preview } from '@storybook/react-native'
import { withBackgrounds } from '@storybook/addon-ondevice-backgrounds'
import { withAppProviders } from './decorators'
import { storybookBackgroundValues } from '@/design-system/tokens/backgrounds'
import { withAutoArgTypes } from './argTypes'

const preview: Preview = {
  decorators: [withBackgrounds, withAppProviders],
  globalTypes: {
    themeMode: {
      name: 'Theme',
      defaultValue: 'light',
      toolbar: {
        icon: 'paintbrush',
        items: ['dark', 'light'],
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
      default: 'light',
      values: [...storybookBackgroundValues],
    },
    actions: {
      argTypesRegex: '^on[A-Z].*',
    },
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  argTypesEnhancers: [withAutoArgTypes as never],
}

export default preview
