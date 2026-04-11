import React from 'react'
import type { AppTextProps, TextTone } from './TextBase'
import { AppText } from './TextBase'

type Props = Omit<AppTextProps, 'size' | 'weight' | 'tone'> & {
  tone?: TextTone
}

export function BodyText({ tone = 'default', ...rest }: Props) {
  return <AppText {...rest} tone={tone} size="md" weight="medium" />
}
