import React from 'react'
import { t } from '@/app/i18n'
import { Card } from '@/ui/components/kit/Card'
import { Button } from '@/ui/components/kit/Button'
import { Stack, Text } from '@/ui/primitives'

export function SessionSummaryModule({
  title,
  subtitle,
  recommendedTitle,
  primaryLabel,
  primaryDisabled,
  onPrimary,
  planTitle,
  planItems,
  testID,
}: {
  title?: string
  subtitle?: string
  recommendedTitle: string
  primaryLabel: string
  primaryDisabled?: boolean
  onPrimary: () => void
  planTitle?: string
  planItems?: { id: string; label: string; isCurrent?: boolean; isDone?: boolean }[]
  testID?: string
}) {
  return (
    <Card testID={testID}>
      <Stack gap={10}>
        <Text size="xl" weight="bold">
          {title ?? t('session.title')}
        </Text>
        <Text tone="muted">{subtitle ?? t('session.subtitle')}</Text>

        <Stack gap={6}>
          <Text size="lg" weight="bold">
            {t('session.recommendedTitle')}
          </Text>
          <Text tone="muted">{t('session.recommendedSubtitle')}</Text>
          <Text weight="bold">{recommendedTitle}</Text>
        </Stack>

        <Button label={primaryLabel} disabled={!!primaryDisabled} onPress={onPrimary} testID={testID ? `${testID}.primary` : undefined} />

        {planItems?.length ? (
          <Stack gap={6}>
            <Text tone="muted" size="sm">
              {planTitle ?? t('session.planTitle')}
            </Text>
            {planItems.map((it, idx) => (
              <Text
                key={`${it.id}-${idx}`}
                tone={it.isDone ? 'muted' : 'default'}
                weight={it.isCurrent ? 'bold' : 'semibold'}
              >
                {idx + 1}. {it.label}
              </Text>
            ))}
          </Stack>
        ) : null}
      </Stack>
    </Card>
  )
}
