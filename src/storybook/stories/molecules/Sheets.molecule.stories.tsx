import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { View } from 'react-native'
import { BottomSheetPanel, ModalSheet } from '@/components/ui/molecules'
import { Heading, BodyText, PrimaryButton, SecondaryButton } from '@/components/ui/atoms'

const meta: Meta<typeof ModalSheet> = {
  title: 'Molecules/Sheets',
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
        <PrimaryButton label="Open Modal" onPress={() => setVisible(true)} />
        <SecondaryButton label="Open Bottom Sheet" onPress={() => ref.current?.snapToIndex(0)} />

        <ModalSheet visible={visible} onClose={() => setVisible(false)}>
          <Heading level={3}>Modal Sheet</Heading>
          <BodyText tone="muted">Reusable modal wrapper with neumorphic shell.</BodyText>
        </ModalSheet>

        <BottomSheetPanel ref={ref} snapPoints={['45%']}>
          <Heading level={3}>Bottom Sheet</Heading>
          <BodyText tone="muted">Vendor API stays wrapped by app-specific component.</BodyText>
        </BottomSheetPanel>
      </View>
    )
  },
}
