import React from 'react'
import { ViewStyle, StyleProp } from 'react-native'
import { Card, Badge } from '../components/kit'
import { Box, Stack, Text } from '../primitives'
import { t } from '@/app/i18n'

export function WaveformCard({
  title,
  subtitle,
  statusLabel,
  rightSlot,
  children,
  contentHeight = 64,
  testID,
  style,
}: {
  title: string
  subtitle?: string
  statusLabel?: string
  rightSlot?: React.ReactNode
  children?: React.ReactNode
  contentHeight?: number
  testID?: string
  style?: StyleProp<ViewStyle>
}) {
  return (
    <Card testID={testID} style={style}>
      <Stack direction="horizontal" justify="space-between" align="center" style={{ gap: 10 }}>
        <Stack gap={2} style={{ flex: 1 }}>
          <Text weight="bold">{title}</Text>
          {subtitle ? <Text tone="muted" size="sm">{subtitle}</Text> : null}
        </Stack>
        <Stack direction="horizontal" align="center" gap={8}>
          {rightSlot}
          {statusLabel ? <Badge label={statusLabel} /> : null}
        </Stack>
      </Stack>
      <Box style={{ height: 12 }} />
      <Box
        style={{
          height: contentHeight,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.10)',
          overflow: 'hidden',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {children ?? (
          <Text tone="muted" size="sm">
            {t('common.waveformSlot')}
          </Text>
        )}
      </Box>
    </Card>
  )
}
