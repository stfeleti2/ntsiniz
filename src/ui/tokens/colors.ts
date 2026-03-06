export const colors = {
  bg: '#0B0B10',
  surface: '#141421',
  surface2: '#1B1B2A',
  text: '#F4F4F7',
  muted: '#A9A9B8',
  border: 'rgba(255,255,255,0.10)',
  primary: '#7C5CFF',
  success: '#2ECC71',
  danger: '#FF4D4D',
  warning: '#FFB020',
  overlay: 'rgba(0,0,0,0.55)',
} as const

export type Colors = typeof colors
