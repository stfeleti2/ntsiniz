import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { Segmented } from '@/ui/components/Segmented'

const meta: Meta<typeof Segmented> = {
  title: 'Molecules/Segmented',
  component: Segmented,
}

export default meta

type Story = StoryObj<typeof meta>

function Demo({ value }: { value: 'warmup' | 'drill' | 'review' }) {
  return (
    <Segmented
      value={value}
      options={[
        { key: 'warmup', label: 'Warmup' },
        { key: 'drill', label: 'Drill' },
        { key: 'review', label: 'Review' },
      ]}
      onChange={() => {}}
      testIDPrefix="segmented"
    />
  )
}

export const Default: Story = { render: () => <Demo value="warmup" /> }
export const Loading: Story = { render: () => <Demo value="drill" /> }
export const Disabled: Story = { render: () => <Demo value="review" /> }
export const Error: Story = { render: () => <Demo value="drill" /> }
export const Empty: Story = { render: () => <Demo value="warmup" /> }
export const Success: Story = { render: () => <Demo value="review" /> }
