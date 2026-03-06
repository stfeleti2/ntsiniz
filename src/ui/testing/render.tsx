import React from 'react'
import TestRenderer from 'react-test-renderer'
import { ThemeProvider } from '../theme'

export function render(ui: React.ReactElement) {
  let tree!: TestRenderer.ReactTestRenderer
  TestRenderer.act(() => {
    tree = TestRenderer.create(<ThemeProvider>{ui}</ThemeProvider>)
  })
  return tree
}
