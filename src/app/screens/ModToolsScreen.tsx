import React, { useEffect, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/Card'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/Button'
import { ListRow } from '@/ui/components/kit/ListRow'
import { Box } from '@/ui'
import { t } from '@/app/i18n'
import { formatDate } from '@/core/i18n'
import { listReports } from '@/core/mod/reportsRepo'
import { listAudit } from '@/core/mod/auditRepo'
import { reportUiError } from '@/app/telemetry/report'

type Props = NativeStackScreenProps<RootStackParamList, 'ModTools'>

export function ModToolsScreen({ navigation }: Props) {
  const [reports, setReports] = useState<any[]>([])
  const [audit, setAudit] = useState<any[]>([])

  const refresh = async () => {
    setReports(await listReports(50))
    setAudit(await listAudit(40))
  }

  useEffect(() => {
    refresh().catch((e) => reportUiError(e))
  }, [])

  return (
    <Screen scroll background="gradient">
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{t('mod.title')}</Text>
        <Text preset="muted">{t('mod.subtitle')}</Text>
      </Box>

      <Card tone="glow">
        <Text preset="h2">{t('mod.reportsTitle')}</Text>
        <Text preset="muted">{t('mod.reportsSubtitle')}</Text>
        <Box style={{ marginTop: 10, gap: 10 }}>
          {reports.length ? (
            reports.map((r) => (
              <ListRow
                key={r.id}
                title={`${r.entityKind}: ${r.reason}`}
                subtitle={`${r.status} · ${formatDate(r.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}`}
                leftIcon={r.status === 'open' ? '🚩' : '✅'}
                onPress={() => (navigation as any).navigate('ReportDetail', { reportId: r.id })}
              />
            ))
          ) : (
            <Text preset="muted">{t('mod.noReports')}</Text>
          )}
        </Box>
      </Card>

      <Card>
        <Text preset="h2">{t('mod.auditTitle')}</Text>
        <Text preset="muted">{t('mod.auditSubtitle')}</Text>
        <Box style={{ marginTop: 10, gap: 10 }}>
          {audit.length ? (
            audit.map((a) => (
              <ListRow
                key={a.id}
                title={`${a.action} ${a.targetKind}`}
                subtitle={`${a.actorName} · ${formatDate(a.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}`}
                leftIcon="🧾"
              />
            ))
          ) : (
            <Text preset="muted">{t('mod.noAudit')}</Text>
          )}
        </Box>
      </Card>

      <Box style={{ gap: 10 }}>
        <Button text={t('mod.refresh')} variant="soft" onPress={() => refresh().catch(() => {})} />
        <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
      </Box>
    </Screen>
  )
}
