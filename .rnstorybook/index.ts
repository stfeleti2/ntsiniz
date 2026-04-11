import * as SecureStore from 'expo-secure-store'

import { view } from './storybook.requires'

const STORYBOOK_STORAGE_PREFIX = 'storybook:'

const storage = {
	async getItem(key: string) {
		try {
			return await SecureStore.getItemAsync(`${STORYBOOK_STORAGE_PREFIX}${key}`)
		} catch {
			return null
		}
	},
	async setItem(key: string, value: string) {
		try {
			await SecureStore.setItemAsync(`${STORYBOOK_STORAGE_PREFIX}${key}`, value)
		} catch {
			// Ignore persistence errors so Storybook can still render in dev.
		}
	},
}

const StorybookUIRoot = view.getStorybookUI({ storage })

export default StorybookUIRoot
