import React from 'react'
import type { AppTextProps, TextTone } from './TextBase'
import { AppText } from './TextBase'

type HeadingLevel = 1 | 2 | 3

type Props = Omit<AppTextProps, 'size' | 'weight' | 'tone'> & {
  level?: HeadingLevel
  tone?: TextTone
}

const levelMap: Record<HeadingLevel, AppTextProps['size']> = {
  1: '2xl',
  2: 'xl',
  3: 'lg',
}

export function Heading({ level = 1, tone = 'default', ...rest }: Props) {
  return <AppText {...rest} tone={tone} size={levelMap[level]} weight="bold" />
}
