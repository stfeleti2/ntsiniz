import React from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import type { MainTabParamList } from "./types"
import { TabBar } from "./TabBar"
import { HomeScreen } from "../screens/HomeScreen"
import { SessionScreen } from "../screens/SessionScreen"
import { JourneyScreen } from "../screens/JourneyScreen"
import { CommunityScreen } from "../screens/CommunityScreen"
import { SettingsScreen } from "../screens/SettingsScreen"
import { isStoreBuild, enableSocial } from "@/core/config/flags"
import { t } from "@/app/i18n"

const Tab = createBottomTabNavigator<MainTabParamList>()

export function MainTabs() {
  const storeBuild = isStoreBuild()
  const socialOn = enableSocial()
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        lazy: true,
      }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: t('tabs.home') }} />
      <Tab.Screen name="Session" component={SessionScreen} options={{ title: t('tabs.session') }} />
      <Tab.Screen name="Journey" component={JourneyScreen} options={{ title: t('tabs.journey') }} />
      {storeBuild || !socialOn ? null : <Tab.Screen name="Community" component={CommunityScreen} options={{ title: t('tabs.community') }} />}
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: t('tabs.settings') }} />
    </Tab.Navigator>
  )
}
