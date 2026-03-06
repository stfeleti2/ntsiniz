export const ImpactFeedbackStyle = {
  Light: 'light',
  Medium: 'medium',
  Heavy: 'heavy',
} as const

export async function impactAsync(_style?: keyof typeof ImpactFeedbackStyle | string) {}

export default {
  ImpactFeedbackStyle,
  impactAsync,
}
