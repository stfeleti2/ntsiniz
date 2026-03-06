import React from 'react'
import { Box } from './Box'
import { useTheme } from '../theme'

export function Divider({ testID }: { testID?: string }) {
  const { colors } = useTheme()
  return <Box testID={testID} style={{ height: 1, backgroundColor: colors.border, width: '100%' }} />
}
