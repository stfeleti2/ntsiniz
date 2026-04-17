import type { ButtonVariantKey, ComponentSize, ComponentState } from './Button/button.variants'
import type { CardVariant, CardState } from './Card/card.variants'
import type { SwitchVariant, SwitchState } from './Switch/switch.variants'
import type { ImagePanelVariant, ImagePanelState } from './ImagePanel/imagePanel.variants'
import type { RadioVariant, RadioState } from './Radio/radio.variants'

export type VariantAxis = {
  size?: ComponentSize
  state: ComponentState | CardState | SwitchState | ImagePanelState
  theme: 'light' | 'dark'
}

export const variantRegistry = {
  button: {
    variants: [
      'primary-light-rounded',
      'icon-round-dark',
      'neo-depth-button',
      'active-led-button',
      'primary',
      'secondary',
      'ghost',
      'danger',
    ] as const satisfies readonly ButtonVariantKey[],
    sizes: ['sm', 'md', 'lg'] as const satisfies readonly ComponentSize[],
    states: ['default', 'hover', 'active', 'disabled'] as const satisfies readonly ComponentState[],
    themes: ['light', 'dark'] as const,
  },
  switch: {
    variants: ['icon-round', 'neo-toggle'] as const satisfies readonly SwitchVariant[],
    states: ['default', 'hover', 'active', 'disabled'] as const satisfies readonly SwitchState[],
    themes: ['light', 'dark'] as const,
  },
  radio: {
    variants: ['neo-dot', 'neo-glow'] as const satisfies readonly RadioVariant[],
    states: ['default', 'hover', 'active', 'disabled'] as const satisfies readonly RadioState[],
    themes: ['light', 'dark'] as const,
  },
  card: {
    variants: ['flat-neo-card', 'layered-card', 'animated-hover-card', 'glow-active-card'] as const satisfies readonly CardVariant[],
    states: ['default', 'hover', 'active', 'disabled'] as const satisfies readonly CardState[],
    themes: ['light', 'dark'] as const,
  },
  imagePanel: {
    variants: ['neo-image', 'depth-inset', 'overlay-glow'] as const satisfies readonly ImagePanelVariant[],
    states: ['default', 'hover', 'active', 'disabled'] as const satisfies readonly ImagePanelState[],
    themes: ['light', 'dark'] as const,
  },
} as const
