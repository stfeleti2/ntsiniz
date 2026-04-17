import React from 'react'
import { Text, type TextProps } from '../../primitives'

type HeadingLevel = 1 | 2 | 3

export type HeadingProps = Omit<TextProps, 'size' | 'weight'> & {
  level?: HeadingLevel
}

const levelMap: Record<HeadingLevel, TextProps['size']> = {
  1: '3xl',
  2: 'xl',
  3: 'lg',
}

export function Heading({ level = 1, tone = 'default', ...rest }: HeadingProps) {
  return <Text {...rest} tone={tone} size={levelMap[level]} weight="bold" />
}
