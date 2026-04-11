import React, { useMemo, useRef, useState } from 'react'
import { View } from 'react-native'
import type BottomSheet from '@gorhom/bottom-sheet'
import { SandboxScreenShell } from '@/components/shared'
import {
  Heading,
  BodyText,
  HelperText,
  PrimaryButton,
  SecondaryButton,
  GhostButton,
  IconButton,
  TextInput,
} from '@/components/ui/atoms'
import {
  Card,
  FieldGroup,
  StatusBanner,
  BottomSheetPanel,
  ModalSheet,
} from '@/components/ui/molecules'
import { AppHeader, ChartPanel, DrillControlPanel, PlaybackControlPanel } from '@/components/ui/organisms'
import { useThemeControls, useTheme } from '@/theme/provider'

export function ComponentPlaygroundScreen() {
  const { spacing } = useTheme()
  const { mode, setMode, motionPreset, setMotionPreset, reducedMotion, setReducedMotion } = useThemeControls()
  const [inputValue, setInputValue] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [bannerTone, setBannerTone] = useState<'info' | 'success' | 'warning' | 'danger'>('info')
  const bottomSheetRef = useRef<BottomSheet>(null)

  const helper = useMemo(() => {
    if (inputValue.length === 0) return 'Type lyrics or a cue to test helper text.'
    if (inputValue.length < 4) return 'Need at least 4 characters for validation.'
    return 'Looks good for this scenario.'
  }, [inputValue])

  return (
    <SandboxScreenShell
      title="Component Playground"
      subtitle="Reusable atoms, molecules, and organisms with live controls."
    >
      <Card tone="elevated">
        <FieldGroup title="Theme">
          <View style={{ flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' }}>
            <PrimaryButton label="Dark" onPress={() => setMode('dark')} />
            <SecondaryButton label="Light" onPress={() => setMode('light')} />
            <GhostButton label="System" onPress={() => setMode('system')} />
          </View>
          <BodyText tone="muted">Current mode: {mode}</BodyText>
        </FieldGroup>

        <FieldGroup title="Motion">
          <View style={{ flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' }}>
            <SecondaryButton label="Snappy" onPress={() => setMotionPreset('snappy')} />
            <PrimaryButton label="Normal" onPress={() => setMotionPreset('normal')} />
            <GhostButton label="Calm" onPress={() => setMotionPreset('calm')} />
          </View>
          <GhostButton
            label={reducedMotion ? 'Reduced Motion: On' : 'Reduced Motion: Off'}
            onPress={() => setReducedMotion(!reducedMotion)}
          />
          <HelperText>Motion preset: {motionPreset}</HelperText>
        </FieldGroup>
      </Card>

      <Card>
        <FieldGroup title="Atoms">
          <Heading level={3}>Heading</Heading>
          <BodyText>Body copy for the component system.</BodyText>
          <HelperText>Helper copy for form states and subtle guidance.</HelperText>
          <View style={{ flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' }}>
            <PrimaryButton label="Primary" />
            <SecondaryButton label="Secondary" />
            <GhostButton label="Ghost" />
            <IconButton icon="mic" />
          </View>
          <TextInput
            label="Drill Name"
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Pitch Warmup"
            helperText={helper}
            errorText={inputValue.length > 0 && inputValue.length < 4 ? 'Minimum 4 characters.' : undefined}
          />
        </FieldGroup>
      </Card>

      <Card tone="glow">
        <FieldGroup title="Molecules">
          <StatusBanner
            title="Status Banner"
            body="Cycle tones to test semantic state colors."
            tone={bannerTone}
          />
          <View style={{ flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' }}>
            <SecondaryButton label="Info" onPress={() => setBannerTone('info')} />
            <SecondaryButton label="Success" onPress={() => setBannerTone('success')} />
            <SecondaryButton label="Warning" onPress={() => setBannerTone('warning')} />
            <SecondaryButton label="Danger" onPress={() => setBannerTone('danger')} />
          </View>
          <View style={{ flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' }}>
            <PrimaryButton label="Open Modal" onPress={() => setShowModal(true)} />
            <SecondaryButton label="Open Bottom Sheet" onPress={() => bottomSheetRef.current?.snapToIndex(0)} />
          </View>
        </FieldGroup>
      </Card>

      <Card tone="elevated">
        <FieldGroup title="Organisms">
          <AppHeader title="Drill Header" subtitle="Organism composition example." />
          <DrillControlPanel />
          <PlaybackControlPanel />
          <ChartPanel />
        </FieldGroup>
      </Card>

      <ModalSheet visible={showModal} onClose={() => setShowModal(false)}>
        <Heading level={3}>Modal Sheet</Heading>
        <BodyText tone="muted">Reusable modal shell for quick content validation.</BodyText>
      </ModalSheet>

      <BottomSheetPanel ref={bottomSheetRef} snapPoints={['45%']}>
        <Heading level={3}>Bottom Sheet</Heading>
        <BodyText tone="muted">This wrapper is based on @gorhom/bottom-sheet.</BodyText>
      </BottomSheetPanel>
    </SandboxScreenShell>
  )
}

