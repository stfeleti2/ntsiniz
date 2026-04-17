import React, { useMemo, useRef, useState } from 'react'
import { View } from 'react-native'
import type BottomSheet from '@gorhom/bottom-sheet'
import { SandboxScreenShell } from '@/components/shared'
import { Heading, IconButton, Input } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/kit'
import { Card } from '@/ui/components/kit'
import { FieldGroup } from '@/ui/components/FieldGroup'
import { StatusBanner } from '@/ui/components/StatusBanner'
import { BottomSheetPanel } from '@/ui/components/BottomSheetPanel'
import { ModalSheet } from '@/ui/components/ModalSheet'
import { AppHeader } from '@/ui/components/AppHeader'
import { ChartPanel } from '@/ui/components/ChartPanel'
import { DrillControlPanel } from '@/ui/components/DrillControlPanel'
import { PlaybackControlPanel } from '@/ui/components/PlaybackControlPanel'
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
            <Button text="Dark" onPress={() => setMode('dark')} />
            <Button text="Light" variant="secondary" onPress={() => setMode('light')} />
            <Button text="System" variant="ghost" onPress={() => setMode('system')} />
          </View>
          <Text preset="muted">Current mode: {mode}</Text>
        </FieldGroup>

        <FieldGroup title="Motion">
          <View style={{ flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' }}>
            <Button text="Snappy" variant="secondary" onPress={() => setMotionPreset('snappy')} />
            <Button text="Normal" onPress={() => setMotionPreset('normal')} />
            <Button text="Calm" variant="ghost" onPress={() => setMotionPreset('calm')} />
          </View>
          <Button
            text={reducedMotion ? 'Reduced Motion: On' : 'Reduced Motion: Off'}
            variant="ghost"
            onPress={() => setReducedMotion(!reducedMotion)}
          />
          <Text preset="caption">Motion preset: {motionPreset}</Text>
        </FieldGroup>
      </Card>

      <Card>
        <FieldGroup title="Atoms">
          <Heading level={3}>Heading</Heading>
          <Text preset="body">Body copy for the component system.</Text>
          <Text preset="caption">Helper copy for form states and subtle guidance.</Text>
          <View style={{ flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' }}>
            <Button text="Primary" />
            <Button text="Secondary" variant="secondary" />
            <Button text="Ghost" variant="ghost" />
            <IconButton icon="mic" />
          </View>
          <Input
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
            <Button text="Info" variant="secondary" onPress={() => setBannerTone('info')} />
            <Button text="Success" variant="secondary" onPress={() => setBannerTone('success')} />
            <Button text="Warning" variant="secondary" onPress={() => setBannerTone('warning')} />
            <Button text="Danger" variant="secondary" onPress={() => setBannerTone('danger')} />
          </View>
          <View style={{ flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' }}>
            <Button text="Open Modal" onPress={() => setShowModal(true)} />
            <Button text="Open Bottom Sheet" variant="secondary" onPress={() => bottomSheetRef.current?.snapToIndex(0)} />
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
        <Text preset="muted">Reusable modal shell for quick content validation.</Text>
      </ModalSheet>

      <BottomSheetPanel ref={bottomSheetRef} snapPoints={['45%']}>
        <Heading level={3}>Bottom Sheet</Heading>
        <Text preset="muted">This wrapper is based on @gorhom/bottom-sheet.</Text>
      </BottomSheetPanel>
    </SandboxScreenShell>
  )
}

