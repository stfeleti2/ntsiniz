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
import { Card } from '@/components/ui/molecules'
import { Heading, BodyText, HelperText, PrimaryButton, SecondaryButton, GhostButton } from '@/components/ui/atoms'
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
        <Heading level={3}>Scenario</Heading>
        <BodyText tone="muted">{scenario.description}</BodyText>
        <View style={styles.row}>
          <SecondaryButton label="Onboarding" onPress={() => setScenarioId('onboarding')} />
          <SecondaryButton label="Sign-In" onPress={() => setScenarioId('signin')} />
          <SecondaryButton label="Singing Start" onPress={() => setScenarioId('singing-start')} />
        </View>
      </Card>

      <Card>
        <Heading level={3}>Data Source</Heading>
        <BodyText tone="muted">Mock mode is fastest; real-nav validates transition contracts.</BodyText>
        <View style={styles.row}>
          <PrimaryButton label="Mock" onPress={() => setDataSource('mock')} />
          <SecondaryButton label="Real Nav" onPress={() => setDataSource('real-nav')} />
        </View>
      </Card>

      <Card>
        <Heading level={3}>Theme + Motion</Heading>
        <View style={styles.row}>
          <GhostButton label="Dark" onPress={() => setMode('dark')} />
          <GhostButton label="Light" onPress={() => setMode('light')} />
          <GhostButton label="System" onPress={() => setMode('system')} />
        </View>
        <View style={styles.row}>
          <GhostButton label="Snappy" onPress={() => setMotionPreset('snappy')} />
          <GhostButton label="Normal" onPress={() => setMotionPreset('normal')} />
          <GhostButton label="Calm" onPress={() => setMotionPreset('calm')} />
        </View>
        <GhostButton
          label={reducedMotion ? 'Reduced Motion: On' : 'Reduced Motion: Off'}
          onPress={() => setReducedMotion(!reducedMotion)}
        />
        <HelperText>
          Theme: {mode} | Motion: {motionPreset}
        </HelperText>
        <MotionPreview />
      </Card>

      <Card>
        <Heading level={3}>Viewport + Locale</Heading>
        <View style={styles.row}>
          <SecondaryButton label="Phone S" onPress={() => setViewport('phone-sm')} />
          <SecondaryButton label="Phone L" onPress={() => setViewport('phone-lg')} />
          <SecondaryButton label="Tablet" onPress={() => setViewport('tablet')} />
        </View>
        <View style={styles.row}>
          <GhostButton
            label="EN"
            onPress={() => {
              setLocale('en')
              setLocaleState('en')
            }}
          />
          <GhostButton
            label="ZU"
            onPress={() => {
              setLocale('zu')
              setLocaleState('zu')
            }}
          />
          <GhostButton
            label="XH"
            onPress={() => {
              setLocale('xh')
              setLocaleState('xh')
            }}
          />
        </View>
        <HelperText>
          Locale: {locale} | Viewport width: {viewportWidth}px
        </HelperText>
      </Card>

      <Card tone={dataSource === 'mock' ? 'glow' : 'elevated'}>
        <Heading level={3}>{scenario.title}</Heading>
        <BodyText tone="muted">
          {dataSource === 'mock'
            ? 'Mock container preview for rapid UX edits.'
            : 'Jump to production screens to validate integration.'}
        </BodyText>

        {dataSource === 'real-nav' ? (
          <View style={[styles.row, { marginTop: 8 }]}>
            <PrimaryButton
              label="Open Start Screen"
              onPress={() => (navigation as any).navigate(scenario.startRoute, scenario.startParams)}
            />
            {scenario.steps.map((step) => (
              <SecondaryButton
                key={step.id}
                label={step.title}
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
                <Heading level={3}>{`${index + 1}. ${step.title}`}</Heading>
                <BodyText tone="muted">{step.summary}</BodyText>
              </Card>
            ))}
          </View>
        )}
      </Card>

      <Card>
        <Heading level={3}>Screen Preview Gallery</Heading>
        <BodyText tone="muted">Open full-screen containers without entering main app business flows.</BodyText>
        <PrimaryButton label="Open Gallery" onPress={() => navigation.navigate('ScreenPreviewGallery')} />
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
      <HelperText>Animation follows selected motion preset.</HelperText>
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

