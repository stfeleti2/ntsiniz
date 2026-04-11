import React from 'react'
import { Card } from '@/components/ui/molecules'
import { Heading, BodyText, PrimaryButton } from '@/components/ui/atoms'

export function DrillSessionCard({
  title,
  subtitle,
  ctaLabel = 'Start Drill',
  onStart,
}: {
  title: string
  subtitle?: string
  ctaLabel?: string
  onStart?: () => void
}) {
  return (
    <Card tone="elevated">
      <Heading level={3}>{title}</Heading>
      {subtitle ? <BodyText tone="muted">{subtitle}</BodyText> : null}
      <PrimaryButton label={ctaLabel} onPress={onStart} />
    </Card>
  )
}

