import React from 'react'
import { ViewStyle, StyleProp } from 'react-native'
import { Stack, Text } from '../../primitives'
import { Button } from './Button'
import { t } from '@/app/i18n'

export function ErrorState({
  title,
  message,
  onRetry,
  style,
  testID,
}: {
  title: string
  message?: string
  onRetry?: () => void
  style?: StyleProp<ViewStyle>
  testID?: string
}) {
  return (
    <Stack testID={testID} gap={12} align="center" style={[{ padding: 16 }, style]}>
      <Text weight="bold" size="lg" tone="danger" style={{ textAlign: 'center' }}>
        {title}
      </Text>
      {message ? <Text tone="muted" style={{ textAlign: 'center' }}>{message}</Text> : null}
      {onRetry ? <Button label={t('common.retry')} onPress={onRetry} testID={testID ? `${testID}.retry` : undefined} /> : null}
    </Stack>
  )
}
