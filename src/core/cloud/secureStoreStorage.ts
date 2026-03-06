import * as SecureStore from 'expo-secure-store'

// Supabase expects a storage adapter with getItem/setItem/removeItem.
// We use SecureStore for auth session persistence.

export const secureStoreAdapter = {
  async getItem(key: string): Promise<string | null> {
    try {
      const v = await SecureStore.getItemAsync(key)
      return v ?? null
    } catch {
      return null
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value)
    } catch {
      // ignore
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key)
    } catch {
      // ignore
    }
  },
}
