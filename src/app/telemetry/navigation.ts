import { createNavigationContainerRef } from '@react-navigation/native'
import * as Sentry from '@sentry/react-native'

export const navigationRef = createNavigationContainerRef()

let lastRouteName: string | undefined

export function onNavReady() {
  try {
    const route = navigationRef.getCurrentRoute()
    lastRouteName = route?.name
    if (lastRouteName) {
      Sentry.setTag('route', lastRouteName)
      Sentry.addBreadcrumb({ category: 'navigation', message: lastRouteName })
    }
  } catch {
    // ignore
  }
}

export function onNavStateChange() {
  try {
    const route = navigationRef.getCurrentRoute()
    const current = route?.name
    if (current && current !== lastRouteName) {
      lastRouteName = current
      Sentry.setTag('route', current)
      Sentry.addBreadcrumb({ category: 'navigation', message: current })
    }
  } catch {
    // ignore
  }
}
