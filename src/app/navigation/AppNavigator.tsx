import React from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import type { RootStackParamList } from "./types"
import { navigationRef, onNavReady, onNavStateChange } from "@/app/telemetry/navigation"
import {
  isStoreBuild,
  enableCloud,
  enableSocial,
  enableInvites,
  enableDuets,
  enableCompetitions,
  enableMarketplace,
  enableDiagnostics,
  enableKaraokeV1,
  enablePerformanceModeV1,
} from "@/core/config/flags"
import { buildLinkingConfig, getEnabledStackScreens, type SurfaceFlags } from "./surfaceScreens"

const Stack = createNativeStackNavigator<RootStackParamList>()

export function getSurfaceFlags(): SurfaceFlags {
  return {
    storeBuild: isStoreBuild(),
    cloudOn: enableCloud(),
    socialOn: enableSocial(),
    invitesOn: enableInvites(),
    duetsOn: enableDuets(),
    competitionsOn: enableCompetitions(),
    marketplaceOn: enableMarketplace(),
    diagnosticsOn: enableDiagnostics(),
    karaokeOn: enableKaraokeV1(),
    performanceOn: enablePerformanceModeV1(),
    dev: !!__DEV__,
  }
}

export function AppNavigator() {
  const flags = getSurfaceFlags()
  const linking = buildLinkingConfig(flags)
  const screens = getEnabledStackScreens(flags)

  return (
    <NavigationContainer ref={navigationRef} linking={linking} onReady={onNavReady} onStateChange={onNavStateChange}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      >
        {screens.map((s) => (
          <Stack.Screen key={String(s.name)} name={s.name} component={s.component} options={s.options} />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
