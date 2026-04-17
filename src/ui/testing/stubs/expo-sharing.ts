export async function isAvailableAsync() {
  return false
}

export async function shareAsync(_uri: string, _options?: any) {
  return { action: 'dismissedAction' }
}

export default {
  isAvailableAsync,
  shareAsync,
}