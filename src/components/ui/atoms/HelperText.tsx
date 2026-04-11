import React from 'react'
import type { AppTextProps, TextTone } from './TextBase'
import { AppText } from './TextBase'

type Props = Omit<AppTextProps, 'size' | 'weight' | 'tone'> & {
  tone?: Extract<TextTone, 'muted' | 'danger' | 'success'>
}

export function HelperText({ tone = 'muted', ...rest }: Props) {
  return <AppText {...rest} tone={tone} size="sm" weight="medium" />
}
