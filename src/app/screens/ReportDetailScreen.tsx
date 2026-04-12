import React, { useEffect, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Alert } from 'react-native'

import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/kit'
import { Box } from '@/ui'
import { t } from '@/app/i18n'
import { formatDate } from '@/core/i18n'
import { getReportById, resolveReport } from '@/core/mod/reportsRepo'
import { ensureSelfPerson } from '@/core/social/peopleRepo'
import { hidePostWithAudit, hideCommentWithAudit, hideClipWithAudit } from '@/core/mod/actions'
import { reportUiError } from '@/app/telemetry/report'

type Props = NativeStackScreenProps<RootStackParamList, 'ReportDetail'>

export function ReportDetailScreen({ navigation, route }: Props) {
  const { reportId } = route.params
  const [r, setR] = useState<any | null>(null)

  const refresh = async () => {
    setR(await getReportById(reportId))
  }

  useEffect(() => {
    refresh().catch((e) => reportUiError(e))
  }, [reportId])

  const doHide = async () => {
    if (!r) return
    const me = await ensureSelfPerson()
    if (r.entityKind === 'post') await hidePostWithAudit({ actorId: me.id, actorName: me.displayName, postId: r.entityId })
    if (r.entityKind === 'comment') await hideCommentWithAudit({ actorId: me.id, actorName: me.displayName, commentId: r.entityId })
    if (r.entityKind === 'clip') await hideClipWithAudit({ actorId: me.id, actorName: me.displayName, clipId: r.entityId })
    Alert.alert(t('mod.hiddenTitle'), t('mod.hiddenBody'))
    await resolveReport(r.id)
    await refresh()
  }

  const doResolve = async () => {
    if (!r) return
    await resolveReport(r.id)
    await refresh()
  }

  if (!r) {
    return (
      <Screen scroll background="gradient">
        <Text preset="h1">{t('common.loading')}</Text>
      </Screen>
    )
  }

  return (
    <Screen scroll background="gradient">
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{t('mod.reportTitle')}</Text>
        <Text preset="muted">{r.entityKind} · {formatDate(r.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}</Text>
      </Box>

      <Card>
        <Text preset="h2">{t('mod.detailsTitle')}</Text>
        <Text preset="muted">{t('mod.reason')}: {r.reason}</Text>
        {r.notes ? <Text preset="muted">{t('mod.notes')}: {r.notes}</Text> : null}
        <Text preset="muted">{t('mod.target')}: {r.entityId}</Text>
        <Text preset="muted">{t('mod.status')}: {r.status}</Text>
      </Card>

      <Box style={{ gap: 10 }}>
        <Button text={t('mod.hideContent')} variant="soft" disabled={r.status !== 'open'} onPress={() => doHide().catch((e) => Alert.alert(t('common.error'), e?.message ?? t('common.error')))} />
        <Button text={t('mod.resolve')} variant="ghost" disabled={r.status !== 'open'} onPress={() => doResolve().catch(() => {})} />
        <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
      </Box>
    </Screen>
  )
}
