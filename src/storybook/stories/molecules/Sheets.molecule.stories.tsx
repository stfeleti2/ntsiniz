import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { View } from 'react-native'
import { BottomSheetPanel } from '@/ui/components/BottomSheetPanel'
import { ModalSheet } from '@/ui/components/ModalSheet'
import { Heading } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/kit'

const meta: Meta<typeof ModalSheet> = {
  title: 'Patterns/Layouts/Sheets',
  component: ModalSheet,
}

export default meta

type Story = StoryObj<typeof meta>

export const ModalAndBottomSheet: Story = {
  render: () => {
    const [visible, setVisible] = React.useState(false)
    const ref = React.useRef<any>(null)

    return (
      <View style={{ gap: 10 }}>
        <Button text="Open Modal" onPress={() => setVisible(true)} />
        <Button text="Open Bottom Sheet" variant="secondary" onPress={() => ref.current?.snapToIndex(0)} />

        <ModalSheet visible={visible} onClose={() => setVisible(false)}>
          <Heading level={3}>Modal Sheet</Heading>
          <Text preset="muted">Reusable modal wrapper with neumorphic shell.</Text>
        </ModalSheet>

        <BottomSheetPanel ref={ref} snapPoints={['45%']}>
          <Heading level={3}>Bottom Sheet</Heading>
          <Text preset="muted">Vendor API stays wrapped by app-specific component.</Text>
        </BottomSheetPanel>
      </View>
    )
  },
}

export const Default = ModalAndBottomSheet
export const Loading = Default
export const Disabled = Default
export const Error = Default
export const Empty = Default
export const Success = Default
