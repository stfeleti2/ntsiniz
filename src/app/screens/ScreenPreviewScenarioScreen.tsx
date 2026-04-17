import React from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { SafeAreaView } from 'react-native-safe-area-context'
import { View } from 'react-native'
import { screenPreviewRegistry } from '@/screens/previews'
import { useTheme } from '@/theme/provider'
import { Button } from '@/ui/components/kit'
import type { RootStackParamList } from '../navigation/types'

type Props = NativeStackScreenProps<RootStackParamList, 'ScreenPreviewScenario'>

export function ScreenPreviewScenarioScreen({ navigation, route }: Props) {
  const { colors, spacing } = useTheme()
  const scenario = route.params?.scenario ?? 'welcome'
  const entry = screenPreviewRegistry[scenario]
  const PreviewComponent = entry.component

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ padding: spacing[3], flexDirection: 'row', gap: spacing[2] }}>
        <Button text="Back to Gallery" variant="secondary" onPress={() => navigation.navigate('ScreenPreviewGallery')} />
        <Button
          text="Flow Playground"
          onPress={() => navigation.navigate('FlowPlayground', { source: 'mock', scenario: 'onboarding' })}
        />
      </View>
      <PreviewComponent />
    </SafeAreaView>
  )
}

