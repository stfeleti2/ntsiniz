import React from 'react'
import { View } from 'react-native'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/Card'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/Button'
import { reportUiError } from '@/app/telemetry/report'
import { t } from '@/app/i18n'

type Props = {
  children: React.ReactNode
}

type State = {
  error: Error | null
}

export class RootErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: any) {
    // Consent-gated inside telemetry gate.
    reportUiError(error, { src: 'root_error_boundary', componentStack: info?.componentStack })
  }

  private restart = async () => {
    // Best-effort soft restart.
    try {
      const Updates = await import('expo-updates')
      await Updates.reloadAsync()
      return
    } catch {
      // ignore
    }
    try {
      const DevSettings = await import('react-native')
      ;(DevSettings as any).DevSettings?.reload?.()
    } catch {
      // ignore
    }
    // If reload isn't available, at least clear the boundary so user can try again.
    this.setState({ error: null })
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <Screen background="gradient">
        <View style={{ gap: 12 }}>
          <Text preset="h1">{t('rootError.title', 'Something went wrong')}</Text>
          <Card tone="elevated">
            <Text preset="body" style={{ fontWeight: '900' }}>
              {t('rootError.body', 'The app hit an unexpected error.')}
            </Text>
            <Text preset="muted">
              {t(
                'rootError.hint',
                'You can restart safely. If you enabled crash reporting, we captured details to help fix it.',
              )}
            </Text>
            <View style={{ height: 10 }} />
            <Button text={t('rootError.restart', 'Restart')} onPress={this.restart} />
          </Card>
        </View>
      </Screen>
    )
  }
}
