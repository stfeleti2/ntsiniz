import React from 'react'
import { Box } from './Box'

export function Spacer({ size = 8, horizontal = false, testID }: { size?: number; horizontal?: boolean; testID?: string }) {
  return <Box testID={testID} style={horizontal ? { width: size } : { height: size }} />
}
