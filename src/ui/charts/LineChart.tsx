import React, { useMemo, useState } from "react"
import Svg, { Path, Circle } from "react-native-svg"
import { useTheme } from "@/theme/useTheme"
import { Box } from '@/ui'

type Props = {
  values: number[]
  height?: number
  padding?: number
  showDots?: boolean
}

export function LineChart({ values, height = 120, padding = 10, showDots = true }: Props) {
  const t = useTheme()
  const [w, setW] = useState(0)

  const { d, dots } = useMemo(() => {
    if (!w || values.length < 2) return { d: "", dots: [] as { x: number; y: number }[] }
    const min = Math.min(...values)
    const max = Math.max(...values)
    const span = Math.max(1, max - min)

    const innerW = Math.max(1, w - padding * 2)
    const innerH = Math.max(1, height - padding * 2)

    const pts = values.map((v, i) => {
      const x = padding + (innerW * i) / Math.max(1, values.length - 1)
      const y = padding + innerH - ((v - min) / span) * innerH
      return { x, y }
    })

    const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ")
    return { d: path, dots: pts }
  }, [w, values, height, padding])

  return (
    <Box
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={{ height, width: "100%", borderRadius: 16, overflow: "hidden", backgroundColor: t.colors.card }}
    >
      <Svg width={w} height={height}>
        <Path d={d} stroke={t.colors.accent} strokeWidth={3} fill="none" />
        {showDots &&
          dots.map((p, i) => (
            <Circle key={i} cx={p.x} cy={p.y} r={4} fill={t.colors.accent} />
          ))}
      </Svg>
    </Box>
  )
}
