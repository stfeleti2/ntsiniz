import React from 'react'
import { View } from 'react-native'

function createAnimatedComponent<T>(Component: React.ComponentType<T>) {
  return React.forwardRef<any, T>(function AnimatedComponent(props, ref) {
    return React.createElement(Component as any, { ...(props as object), ref } as any)
  })
}

const AnimatedView = createAnimatedComponent(View)

const Animated = {
  View: AnimatedView,
  createAnimatedComponent,
}

export default Animated

export const Easing = {
  out: (x: any) => x,
  in: (x: any) => x,
  inOut: (x: any) => x,
  linear: {},
  quad: {},
  cubic: {},
  bezier: () => ({}),
}

export function useSharedValue<T>(value: T) {
  return { value }
}

export function useAnimatedStyle<T extends Record<string, any>>(fn: () => T): T {
  return fn()
}

export function useDerivedValue<T>(fn: () => T) {
  return { value: fn() }
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

export function withDelay<T>(_delayMs: number, value: T): T {
  return value
}

export function interpolate(
  value: number,
  inputRange: number[] = [0, 1],
  outputRange: number[] = [0, 1],
) {
  if (inputRange.length < 2 || outputRange.length < 2) return value
  const [inMin, inMax] = inputRange
  const [outMin, outMax] = outputRange
  if (inMax === inMin) return outMin
  const progress = (value - inMin) / (inMax - inMin)
  return outMin + progress * (outMax - outMin)
}

export function runOnJS<T extends (...args: any[]) => any>(fn: T): T {
  return fn
}

export const Extrapolate = {
  CLAMP: 'clamp',
}

export const FadeInDown = {
  duration() {
    return {
      delay() {
        return { type: 'fade-in-down' }
      },
    }
  },
}
