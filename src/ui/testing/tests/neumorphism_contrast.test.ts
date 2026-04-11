import test from 'node:test'
import assert from 'node:assert/strict'

import { buildTheme } from '@/theme/provider'
import { getNeumorphismRule, getNeumorphicSurfaceStyle } from '@/theme/neumorphism'
import type { SurfaceVariant } from '@/theme/tokens'

const variants: SurfaceVariant[] = ['flat', 'raised', 'inset', 'pressed', 'glass']

test('neumorphism states expose bounded alpha values', () => {
  for (const variant of variants) {
    const rule = getNeumorphismRule(variant, 'default')
    assert.equal(rule.borderAlpha >= 0 && rule.borderAlpha <= 1, true)
    assert.equal(rule.shadowAlpha >= 0 && rule.shadowAlpha <= 1, true)
    assert.equal(rule.highlightAlpha >= 0 && rule.highlightAlpha <= 1, true)
  }
})

test('light and dark themes produce surface style for every variant', () => {
  const dark = buildTheme({ mode: 'dark' })
  const light = buildTheme({ mode: 'light' })

  for (const variant of variants) {
    const darkStyle = getNeumorphicSurfaceStyle(dark, { variant, quality: 'full' })
    const lightStyle = getNeumorphicSurfaceStyle(light, { variant, quality: 'full' })
    assert.equal(typeof darkStyle.backgroundColor, 'string')
    assert.equal(typeof lightStyle.backgroundColor, 'string')
    assert.equal(typeof darkStyle.borderColor, 'string')
    assert.equal(typeof lightStyle.borderColor, 'string')
  }
})

