declare module 'expo-updates' {
  export function reloadAsync(): Promise<void>
  export const isAvailable: boolean
  const Updates: {
    reloadAsync: () => Promise<void>
    isAvailable?: boolean
  }
  export default Updates
}
