import React from 'react'
import { Modal, ViewStyle, StyleProp } from 'react-native'
import { Box, Stack, Text, Pressable } from '../primitives'
import { useTheme } from '../theme'
import { Button, IconButton } from '../components/kit'
import { t } from '@/app/i18n'

export type RecordingOverlayProps = {
  visible: boolean
  mode?: 'full' | 'pill'
  elapsedLabel: string
  onStop?: () => void
  onPause?: () => void
  onResume?: () => void
  onMinimize?: () => void
  paused?: boolean
  testID?: string
  style?: StyleProp<ViewStyle>
  /** Optional: background visuals (e.g., Ghost Guide) rendered behind the card. */
  children?: React.ReactNode
}

export function RecordingOverlay({
  visible,
  mode = 'full',
  elapsedLabel,
  onStop,
  onPause,
  onResume,
  onMinimize,
  paused,
  testID,
  style,
  children,
}: RecordingOverlayProps) {
  const { colors, spacing, radius, zIndex } = useTheme()

  if (!visible) return null

  const content = (
    <Box
      testID={testID}
      style={[
        mode === 'full'
          ? {
              flex: 1,
              backgroundColor: colors.overlay,
              alignItems: 'center',
              justifyContent: 'center',
              padding: spacing[6],
            }
          : {
              position: 'absolute',
              left: spacing[4],
              right: spacing[4],
              top: spacing[6],
              zIndex: zIndex.overlay,
            },
        style,
      ]}
    >
      {mode === 'full' && children ? (
        <Box
          pointerEvents="none"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          {children}
        </Box>
      ) : null}

      <Box
        style={{
          width: '100%',
          maxWidth: 520,
          backgroundColor: colors.surface2,
          borderRadius: radius[4],
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing[4],
        }}
      >
        <Stack direction="horizontal" justify="space-between" align="center">
          <Stack gap={2}>
            <Text weight="bold">{t('common.recording')}</Text>
            <Text tone="muted">{elapsedLabel}</Text>
          </Stack>
          {mode === 'full' && onMinimize ? <IconButton icon="_" onPress={onMinimize} testID={testID ? `${testID}.minimize` : undefined} /> : null}
        </Stack>

        <Box style={{ height: 14 }} />

        <Stack direction="horizontal" gap={12} align="center" justify="space-between">
          {onStop ? (
            <Button
              testID={testID ? `${testID}.stop` : undefined}
              label={t('common.stop')}
              variant="danger"
              onPress={onStop}
            />
          ) : null}
          {paused ? (
            onResume ? (
              <Button testID={testID ? `${testID}.resume` : undefined} label={t('common.resume')} variant="secondary" onPress={onResume} />
            ) : null
          ) : onPause ? (
            <Button testID={testID ? `${testID}.pause` : undefined} label={t('common.pause')} variant="secondary" onPress={onPause} />
          ) : null}
        </Stack>
      </Box>
    </Box>
  )

  if (mode === 'pill') return content

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.dismiss')}
        onPress={onMinimize}
        style={{ flex: 1 }}
      >
        {content}
      </Pressable>
    </Modal>
  )
}
