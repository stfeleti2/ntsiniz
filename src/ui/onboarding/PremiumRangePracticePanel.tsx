import React, { useEffect, useMemo, useState } from 'react'
import { LayoutChangeEvent, StyleSheet, View } from 'react-native'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import {
  Canvas,
  Circle,
  Group,
  Line,
  LinearGradient as SkiaLinearGradient,
  Path,
  Rect,
  RoundedRect,
  Skia,
  vec,
} from '@shopify/react-native-skia'

import { Text } from '@/ui/components/Typography'
import { RANGE_LADDER_TOP_TO_BOTTOM } from './rangeLadder'

const LADDER_ORDER = RANGE_LADDER_TOP_TO_BOTTOM as unknown as string[]

export function PremiumRangePracticePanel({
  likelyZone,
  progress,
  traceValues,
  phraseChunks,
  elapsedLabel,
  totalLabel,
  onScrub,
}: {
  likelyZone: string
  progress: number
  traceValues: number[]
  phraseChunks: string[]
  elapsedLabel: string
  totalLabel: string
  onScrub?: (next: number) => void
}) {
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 })
  const sliderWidth = useSharedValue(1)
  const scrub = useSharedValue(clamp01(progress))
  const lastScrubSent = useSharedValue(-1)
  const pulse = useSharedValue(0.4)

  useEffect(() => {
    scrub.value = withTiming(clamp01(progress), { duration: 220, easing: Easing.out(Easing.cubic) })
  }, [progress, scrub])

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 640, easing: Easing.inOut(Easing.quad) }), -1, true)
  }, [pulse])

  const tracePath = useMemo(() => {
    if (chartSize.width < 2 || chartSize.height < 2 || traceValues.length < 2) return null
    const path = Skia.Path.Make()
    const top = chartSize.height * 0.16
    const bottom = chartSize.height * 0.82
    const count = traceValues.length
    traceValues.forEach((value, index) => {
      const x = count <= 1 ? 0 : (index / (count - 1)) * chartSize.width
      const y = bottom - clamp01(value) * (bottom - top)
      if (index === 0) path.moveTo(x, y)
      else path.lineTo(x, y)
    })
    return path
  }, [chartSize.height, chartSize.width, traceValues])

  const onRailLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout
    if (width <= 0 || height <= 0) return
    setChartSize({ width, height })
  }

  const scrubGesture = Gesture.Pan()
    .onBegin((event) => {
      const width = Math.max(1, sliderWidth.value)
      const next = Math.max(0, Math.min(1, event.x / width))
      scrub.value = next
      if (onScrub) {
        lastScrubSent.value = next
        runOnJS(onScrub)(next)
      }
    })
    .onUpdate((event) => {
      const width = Math.max(1, sliderWidth.value)
      const next = Math.max(0, Math.min(1, event.x / width))
      scrub.value = next
      if (onScrub && Math.abs(next - lastScrubSent.value) >= 0.008) {
        lastScrubSent.value = next
        runOnJS(onScrub)(next)
      }
    })

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: scrub.value * Math.max(1, sliderWidth.value) - 9 }],
  }))

  const fillStyle = useAnimatedStyle(() => ({
    width: scrub.value * Math.max(1, sliderWidth.value),
  }))

  const playheadStyle = useAnimatedStyle(() => ({
    opacity: 0.44 + pulse.value * 0.42,
  }))

  const activeZone = likelyZone.toLowerCase()
  const zoneIndex = LADDER_ORDER.findIndex((zone) => zone.toLowerCase() === activeZone)
  const topLabel = 'Highest'
  const bottomLabel = 'Lowest'

  return (
    <View style={styles.wrap}>
      <View style={styles.ladderCol}>
        <Text preset="muted" style={styles.ladderTop}>
          {topLabel}
        </Text>
        <Canvas style={styles.ladderCanvas}>
          {LADDER_ORDER.map((zone, index) => {
            const y = (index / (LADDER_ORDER.length - 1)) * 212
            const isActive = zone.toLowerCase() === activeZone
            const near = zoneIndex >= 0 && Math.abs(index - zoneIndex) <= 1
            return (
              <RoundedRect
                key={`ladder-${zone}`}
                x={0}
                y={y}
                width={18}
                height={isActive ? 9 : 7}
                r={999}
                color={isActive ? '#83F4D5' : near ? 'rgba(180,165,255,0.66)' : 'rgba(135,120,196,0.42)'}
              />
            )
          })}
        </Canvas>
        <View style={styles.ladderLabels}>
          {LADDER_ORDER.map((zone) => {
            const highlighted = zone.toLowerCase() === activeZone
            return (
              <Text key={`zone-${zone}`} preset="caption" style={{ color: highlighted ? '#9FFFE7' : '#AFA4D8', fontWeight: highlighted ? '700' : '500' }}>
                {zone}
              </Text>
            )
          })}
        </View>
        <Text preset="muted" style={styles.ladderBottom}>
          {bottomLabel}
        </Text>
      </View>

      <View style={styles.railCol}>
        <LinearGradient colors={['rgba(116,95,222,0.4)', 'rgba(30,21,71,0.92)', 'rgba(16,15,37,0.96)']} style={styles.railShell} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.railInner} onLayout={onRailLayout}>
            <Canvas style={StyleSheet.absoluteFill}>
              <Rect x={0} y={0} width={chartSize.width} height={chartSize.height} color="rgba(10,8,25,0.56)" />
              <Group opacity={0.9}>
                {phraseChunks.map((chunk, index) => {
                  const count = Math.max(1, phraseChunks.length)
                  const gap = 8
                  const available = Math.max(24, chartSize.width - gap * (count - 1))
                  const segmentW = available / count
                  const x = index * (segmentW + gap)
                  const y = chartSize.height * (0.44 + (index % 2 === 0 ? -0.04 : 0.02))
                  const active = clamp01(progress) >= (index + 0.2) / count
                  return (
                    <RoundedRect key={`segment-${chunk}-${index}`} x={x} y={y} width={Math.max(18, segmentW)} height={10} r={999}>
                      <SkiaLinearGradient
                        start={vec(x, y)}
                        end={vec(x + Math.max(18, segmentW), y)}
                        colors={active ? ['#86EFFF', '#BFB0FF'] : ['rgba(170,147,239,0.5)', 'rgba(173,150,236,0.34)']}
                      />
                    </RoundedRect>
                  )
                })}
              </Group>

              {tracePath ? (
                <Path path={tracePath} color="#91F9E8" style="stroke" strokeWidth={4} strokeJoin="round" strokeCap="round" />
              ) : null}

              <Line p1={vec(chartSize.width / 2, 0)} p2={vec(chartSize.width / 2, chartSize.height)} color="rgba(124,245,255,0.95)" strokeWidth={2} />
              <Circle cx={chartSize.width / 2} cy={chartSize.height * 0.5} r={6} color="rgba(155,255,241,0.92)" />
            </Canvas>
            <Animated.View pointerEvents="none" style={[styles.playheadGlow, playheadStyle]} />
          </View>
        </LinearGradient>

        <View style={styles.timeRow}>
          <Text preset="muted">{elapsedLabel}</Text>
          <Text preset="muted">{totalLabel}</Text>
        </View>

        <GestureDetector gesture={scrubGesture}>
          <BlurView
            intensity={40}
            tint="dark"
            onLayout={(event) => {
              sliderWidth.value = Math.max(1, event.nativeEvent.layout.width)
            }}
            style={styles.scrubTrack}
          >
            <Animated.View style={[styles.scrubFill, fillStyle]} />
            <Animated.View style={[styles.scrubThumb, thumbStyle]} />
          </BlurView>
        </GestureDetector>
      </View>
    </View>
  )
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value))
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'stretch',
  },
  ladderCol: {
    width: 94,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(191,181,246,0.34)',
    backgroundColor: 'rgba(23,18,45,0.88)',
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#04040E',
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  ladderTop: { alignSelf: 'stretch', textAlign: 'left', fontSize: 11 },
  ladderBottom: { alignSelf: 'stretch', textAlign: 'left', fontSize: 11 },
  ladderCanvas: { width: 18, height: 220, marginTop: 6, marginBottom: 8 },
  ladderLabels: { position: 'absolute', left: 34, top: 22, bottom: 22, justifyContent: 'space-between' },
  railCol: { flex: 1, gap: 8 },
  railShell: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(196,186,255,0.4)',
    padding: 10,
    shadowColor: '#07040F',
    shadowOpacity: 0.42,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
  },
  railInner: {
    height: 168,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(169,151,236,0.28)',
    backgroundColor: 'rgba(13,11,29,0.84)',
  },
  playheadGlow: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 12,
    left: '50%',
    marginLeft: -6,
    backgroundColor: 'rgba(122,245,255,0.25)',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  scrubTrack: {
    height: 22,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(202,192,255,0.38)',
    overflow: 'hidden',
    justifyContent: 'center',
    backgroundColor: 'rgba(21,17,42,0.6)',
  },
  scrubFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(150,133,255,0.56)',
  },
  scrubThumb: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#DDF4FF',
    borderWidth: 1,
    borderColor: 'rgba(178,162,245,0.66)',
    top: 1.5,
    shadowColor: '#95E5FF',
    shadowOpacity: 0.44,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
})
