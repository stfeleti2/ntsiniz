import { useNavigation } from '@react-navigation/native'

export function useAppNav() {
  return useNavigation<any>()
}
