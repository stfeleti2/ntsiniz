import type { StorybookConfig } from '@storybook/react-native-web-vite'
import { mergeConfig } from 'vite'

import { createStorybookViteConfig } from './vite.config.ts'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.tsx'],
  addons: ['@storybook/addon-docs', '@storybook/addon-themes'],
  framework: {
    name: '@storybook/react-native-web-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => mergeConfig(config, createStorybookViteConfig()),
}

export default config