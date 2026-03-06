import React from "react"
import Svg, { Line, Path, Text as SvgText } from "react-native-svg"
import { useTheme } from "@/theme/useTheme"
import { Box } from '@/ui'
import { formatNumber } from '@/core/i18n'

export function TunerGauge({ cents, windowCents = 25 }: { cents: number; windowCents?: number }) {
  const t = useTheme()
  const c = clamp(cents, -50, 50)

  // map cents to angle (-60..60)
  const angle = (c / 50) * 60
  const cx = 160
  const cy = 120
  const r = 90

  const rad = (Math.PI / 180) * angle
  const x2 = cx + r * Math.sin(rad)
  const y2 = cy - r * Math.cos(rad)

  const left = polar(cx, cy, r, -60)
  const right = polar(cx, cy, r, 60)
  const arc = describeArc(cx, cy, r, -60, 60)

  const winLeft = polar(cx, cy, r, (-windowCents / 50) * 60)
  const winRight = polar(cx, cy, r, (windowCents / 50) * 60)

  return (
    <Box style={{ borderRadius: 22, overflow: "hidden" }}>
      <Svg width={320} height={200}>
        <Path d={arc} stroke={t.colors.line} strokeWidth={10} fill="none" strokeLinecap="round" />

        {/* in-tune arc */}
        <Path
          d={describeArc(cx, cy, r, (-windowCents / 50) * 60, (windowCents / 50) * 60)}
          stroke={t.colors.good}
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
        />

        {/* ticks */}
        <Line x1={left.x} y1={left.y} x2={left.x} y2={left.y + 10} stroke={t.colors.muted} strokeWidth={2} />
        <Line x1={right.x} y1={right.y} x2={right.x} y2={right.y + 10} stroke={t.colors.muted} strokeWidth={2} />
        <Line x1={winLeft.x} y1={winLeft.y} x2={winLeft.x} y2={winLeft.y + 8} stroke={t.colors.good} strokeWidth={2} />
        <Line x1={winRight.x} y1={winRight.y} x2={winRight.x} y2={winRight.y + 8} stroke={t.colors.good} strokeWidth={2} />

        {/* needle */}
        <Line x1={cx} y1={cy} x2={x2} y2={y2} stroke={t.colors.text} strokeWidth={4} strokeLinecap="round" />
        <SvgText x={cx} y={190} fontSize={14} fill={t.colors.muted} textAnchor="middle">
          {formatNumber(c, { maximumFractionDigits: 0, minimumFractionDigits: 0 })} cents
        </SvgText>
      </Svg>
    </Box>
  )
}

function clamp(x: number, a: number, b: number) {
  return Math.max(a, Math.min(b, x))
}

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = (Math.PI / 180) * angleDeg
  return { x: cx + r * Math.sin(a), y: cy - r * Math.cos(a) }
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polar(cx, cy, r, endAngle)
  const end = polar(cx, cy, r, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"
  return ["M", start.x, start.y, "A", r, r, 0, largeArcFlag, 0, end.x, end.y].join(" ")
}
