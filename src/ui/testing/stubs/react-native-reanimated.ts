import React from 'react'

const AnimatedView = React.forwardRef<any, any>((props, ref) => React.createElement('Animated.View', { ...props, ref }, props.children))

const Animated = {
  View: AnimatedView,
}

export default Animated

export const Easing = {
  inOut: (x: any) => x,
  quad: {},
}

export function useSharedValue<T>(value: T) {
  return { value }
}

export function useAnimatedStyle<T extends Record<string, any>>(fn: () => T): T {
  return fn()
}

export function withSpring<T>(value: T): T {
  return value
}

export function withTiming<T>(value: T): T {
  return value
}

export function withRepeat<T>(value: T): T {
  return value
}

export function interpolate(value: number): number {
  return value
}

export function runOnJS<T extends (...args: any[]) => any>(fn: T): T {
  return fn
}
