import React from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { getLocale, setLocale } from '@/app/i18n'
import { flowScenarios, viewportWidths } from '@/app/dev/sandbox/scenarios'
import type { FlowScenarioId, SandboxDataSource, ViewportPreset } from '@/app/dev/sandbox/types'
import { SandboxScreenShell } from '@/components/shared'
import { Card } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/kit'
import { useTheme, useThemeControls } from '@/theme/provider'
import type { RootStackParamList } from '../navigation/types'

type Props = NativeStackScreenProps<RootStackParamList, 'FlowPlayground'>

export function FlowPlaygroundScreen({ navigation, route }: Props) {
  const theme = useTheme()
  const [dataSource, setDataSource] = React.useState<SandboxDataSource>(route.params?.source ?? 'mock')
  const [scenarioId, setScenarioId] = React.useState<FlowScenarioId>(route.params?.scenario ?? 'onboarding')
  const [viewport, setViewport] = React.useState<ViewportPreset>('phone-lg')
  const [locale, setLocaleState] = React.useState(getLocale())
  const { mode, setMode, motionPreset, setMotionPreset, reducedMotion, setReducedMotion } = useThemeControls()

  const scenario = flowScenarios[scenarioId]
  const viewportWidth = viewportWidths[viewport]

  return (
    <SandboxScreenShell
      title="Flow Playground"
      subtitle="Switch scenarios instantly. Validate with mock containers or real navigation."
    >
      <Card tone="elevated">
        <Text preset="h3">Scenario</Text>
        <Text preset="muted">{scenario.description}</Text>
        <View style={styles.row}>
          <Button text="Onboarding" variant="secondary" onPress={() => setScenarioId('onboarding')} />
          <Button text="Sign-In" variant="secondary" onPress={() => setScenarioId('signin')} />
          <Button text="Singing Start" variant="secondary" onPress={() => setScenarioId('singing-start')} />
        </View>
      </Card>

      <Card>
        <Text preset="h3">Data Source</Text>
        <Text preset="muted">Mock mode is fastest; real-nav validates transition contracts.</Text>
        <View style={styles.row}>
          <Button text="Mock" onPress={() => setDataSource('mock')} />
          <Button text="Real Nav" variant="secondary" onPress={() => setDataSource('real-nav')} />
        </View>
      </Card>

      <Card>
        <Text preset="h3">Theme + Motion</Text>
        <View style={styles.row}>
          <Button text="Dark" variant="ghost" onPress={() => setMode('dark')} />
          <Button text="Light" variant="ghost" onPress={() => setMode('light')} />
          <Button text="System" variant="ghost" onPress={() => setMode('system')} />
        </View>
        <View style={styles.row}>
          <Button text="Snappy" variant="ghost" onPress={() => setMotionPreset('snappy')} />
          <Button text="Normal" variant="ghost" onPress={() => setMotionPreset('normal')} />
          <Button text="Calm" variant="ghost" onPress={() => setMotionPreset('calm')} />
        </View>
        <Button
          text={reducedMotion ? 'Reduced Motion: On' : 'Reduced Motion: Off'}
          variant="ghost"
          onPress={() => setReducedMotion(!reducedMotion)}
        />
        <Text preset="caption">
          Theme: {mode} | Motion: {motionPreset}
        </Text>
        <MotionPreview />
      </Card>

      <Card>
        <Text preset="h3">Viewport + Locale</Text>
        <View style={styles.row}>
          <Button text="Phone S" variant="secondary" onPress={() => setViewport('phone-sm')} />
          <Button text="Phone L" variant="secondary" onPress={() => setViewport('phone-lg')} />
          <Button text="Tablet" variant="secondary" onPress={() => setViewport('tablet')} />
        </View>
        <View style={styles.row}>
          <Button
            text="EN"
            variant="ghost"
            onPress={() => {
              setLocale('en')
              setLocaleState('en')
            }}
          />
          <Button
            text="ZU"
            variant="ghost"
            onPress={() => {
              setLocale('zu')
              setLocaleState('zu')
            }}
          />
          <Button
            text="XH"
            variant="ghost"
            onPress={() => {
              setLocale('xh')
              setLocaleState('xh')
            }}
          />
        </View>
        <Text preset="caption">
          Locale: {locale} | Viewport width: {viewportWidth}px
        </Text>
      </Card>

      <Card tone={dataSource === 'mock' ? 'glow' : 'elevated'}>
        <Text preset="h3">{scenario.title}</Text>
        <Text preset="muted">
          {dataSource === 'mock'
            ? 'Mock container preview for rapid UX edits.'
            : 'Jump to production screens to validate integration.'}
        </Text>

        {dataSource === 'real-nav' ? (
          <View style={[styles.row, { marginTop: 8 }]}>
            <Button
              text="Open Start Screen"
              onPress={() => (navigation as any).navigate(scenario.startRoute, scenario.startParams)}
            />
            {scenario.steps.map((step) => (
              <Button
                key={step.id}
                text={step.title}
                variant="secondary"
                onPress={() => {
                  if (!step.route) return
                  ;(navigation as any).navigate(step.route, step.params)
                }}
              />
            ))}
          </View>
        ) : (
          <View
            style={[
              styles.mockFrame,
              {
                width: viewportWidth,
                backgroundColor: theme.colors.surfaceInset,
                borderColor: theme.colors.border,
              },
            ]}
          >
            {scenario.steps.map((step, index) => (
              <Card key={step.id} tone={index === 0 ? 'glow' : 'default'}>
                <Text preset="h3">{`${index + 1}. ${step.title}`}</Text>
                <Text preset="muted">{step.summary}</Text>
              </Card>
            ))}
          </View>
        )}
      </Card>

      <Card>
        <Text preset="h3">Screen Preview Gallery</Text>
        <Text preset="muted">Open full-screen containers without entering main app business flows.</Text>
        <Button text="Open Gallery" onPress={() => navigation.navigate('ScreenPreviewGallery')} />
      </Card>
    </SandboxScreenShell>
  )
}

function MotionPreview() {
  const { colors, motion } = useTheme()
  const pulse = useSharedValue(0.2)

  React.useEffect(() => {
    if (motion.normal <= 0) {
      pulse.value = 1
      return
    }

    pulse.value = withRepeat(
      withTiming(1, {
        duration: Math.max(80, motion.normal),
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true,
    )
  }, [motion.normal, pulse])

  const animated = useAnimatedStyle(() => ({
    opacity: 0.2 + pulse.value * 0.7,
    transform: [{ scale: 0.94 + pulse.value * 0.08 }],
  }))

  return (
    <View style={styles.motionWrap}>
      <Animated.View style={[styles.pulseDot, animated, { backgroundColor: colors.primary }]} />
      <Text preset="caption">Animation follows selected motion preset.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  mockFrame: {
    marginTop: 12,
    alignSelf: 'center',
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  motionWrap: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pulseDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
})

