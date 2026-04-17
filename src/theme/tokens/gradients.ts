export const darkGradients = {
  primary: ['#9B8DFF', '#F6A6FF', '#83DEFF'],
  surface: ['rgba(30, 36, 57, 0.92)', 'rgba(40, 48, 73, 0.96)'],
  glow: ['rgba(153, 129, 255, 0.38)', 'rgba(246, 166, 255, 0.24)', 'rgba(137, 233, 255, 0.2)'],
  hero: ['#070911', '#1A1436', '#231B45', '#070911'],
} as const

export const lightGradients: { [K in keyof typeof darkGradients]: readonly string[] } = {
  primary: ['#7566FF', '#C656BC', '#18A9D9'],
  surface: ['rgba(255, 255, 255, 0.92)', 'rgba(247, 250, 255, 0.96)'],
  glow: ['rgba(117, 102, 255, 0.22)', 'rgba(198, 86, 188, 0.18)', 'rgba(24, 169, 217, 0.18)'],
  hero: ['#F3F6FF', '#E9EEFF', '#DCE6FF', '#F3F6FF'],
}

export type Gradients = typeof darkGradients