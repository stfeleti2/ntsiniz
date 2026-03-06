import React, { useEffect, useMemo, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/Card'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/Button'
import { ListRow } from '@/ui/components/kit/ListRow'
import { Box } from '@/ui'
import { t } from '@/app/i18n'
import { requirePro } from '@/core/billing/requirePro'
import { hasPro } from '@/core/billing/entitlementsRepo'
import { loadMarketplaceCoaches, loadMarketplacePrograms } from '@/core/marketplace/loader'
import { ensureSelfPerson } from '@/core/social/peopleRepo'
import { enrollInProgram, getEnrollment, parseCompletedDays } from '@/core/marketplace/enrollmentsRepo'
import { reportUiError } from '@/app/telemetry/report'

type Props = NativeStackScreenProps<RootStackParamList, 'ProgramDetail'>

export function ProgramDetailScreen({ navigation, route }: Props) {
  const { programId } = route.params
  const coaches = useMemo(() => loadMarketplaceCoaches(), [])
  const programs = useMemo(() => loadMarketplacePrograms(), [])
  const program = programs.programs.find((p) => p.id === programId)
  const coach = program ? coaches.coaches.find((c) => c.id === program.coachId) : null
  const [enrolled, setEnrolled] = useState<any | null>(null)
  const [pro, setPro] = useState(false)

  useEffect(() => {
    ;(async () => {
      setPro(await hasPro().catch(() => false))
      const me = await ensureSelfPerson()
      if (!program) return
      setEnrolled(await getEnrollment(me.id, program.id))
    })().catch((e) => reportUiError(e))
  }, [programId])

  if (!program) {
    return (
      <Screen scroll background="gradient">
        <Text preset="h1">{t('marketplace.notFound')}</Text>
        <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
      </Screen>
    )
  }

  const completed = enrolled ? new Set(parseCompletedDays(enrolled.completedDaysJson)) : new Set<number>()

  const enroll = async () => {
    if (program.access === 'pro') {
      await requirePro({ navigation, reason: 'program', onSuccess: () => {} })
      const ok = await hasPro().catch(() => false)
      if (!ok) return
    }
    const me = await ensureSelfPerson()
    const e = await enrollInProgram({ userId: me.id, programId: program.id, coachId: program.coachId })
    setEnrolled(e)
  }

  return (
    <Screen scroll background="gradient">
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{program.title}</Text>
        <Text preset="muted">{coach ? coach.name : ''}{coach ? ' · ' : ''}{program.subtitle ?? ''}</Text>
      </Box>

      <Card tone={enrolled ? 'glow' : 'default'}>
        <Text preset="h2">{t('marketplace.enrollmentTitle')}</Text>
        <Text preset="muted">{enrolled ? t('marketplace.enrolledLine', { day: enrolled.currentDay }) : t('marketplace.notEnrolledLine')}</Text>
        <Box style={{ marginTop: 10 }}>
          {program.access === 'pro' && !pro && !enrolled ? (
            <>
              <Text preset="muted" style={{ marginBottom: 10 }}>{t('marketplace.proRequired')}</Text>
              <Button text={t('paywall.unlock')} onPress={() => (navigation as any).navigate('Paywall', { reason: 'program' })} />
            </>
          ) : (
            <Button text={enrolled ? t('marketplace.continue') : t('marketplace.enroll')} onPress={() => enroll().catch((e) => reportUiError(e))} />
          )}
        </Box>
      </Card>

      <Card>
        <Text preset="h2">{t('marketplace.daysTitle')}</Text>
        <Text preset="muted">{t('marketplace.daysSubtitle')}</Text>
        <Box style={{ marginTop: 10, gap: 10 }}>
          {program.days.map((d) => (
            <ListRow
              key={d.day}
              title={`${t('marketplace.day')} ${d.day}: ${d.title}`}
              subtitle={completed.has(d.day) ? t('marketplace.completed') : enrolled && d.day === enrolled.currentDay ? t('marketplace.nextUp') : t('marketplace.lockedHint')}
              leftIcon={completed.has(d.day) ? '✅' : enrolled && d.day === enrolled.currentDay ? '🎯' : '🔒'}
              onPress={() => (navigation as any).navigate('ProgramDayComplete', { programId: program.id, day: d.day })}
            />
          ))}
        </Box>
      </Card>

      <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  )
}
