import React from 'react'

function pass(name: string) {
  return function Component(props: any) {
    return React.createElement(name, props, props?.children)
  }
}

export const Canvas = pass('Canvas')
export const Rect = pass('Rect')
export const RoundedRect = pass('RoundedRect')
export const Line = pass('Line')
export const Group = pass('Group')
export const Path = pass('Path')
export const Circle = pass('Circle')
export const LinearGradient = pass('LinearGradient')

export const Skia = {
  Path: {
    Make() {
      return {
        moveTo() {},
        lineTo() {},
      }
    },
  },
}

export function vec(x: number, y: number) {
  return { x, y }
}

