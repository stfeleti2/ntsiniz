import React from 'react'
import { Card } from '@/ui/components/kit'
import { Button } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'

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
      <Text preset="h3">{title}</Text>
      {subtitle ? <Text preset="muted">{subtitle}</Text> : null}
      <Button text={ctaLabel} onPress={onStart} />
    </Card>
  )
}

