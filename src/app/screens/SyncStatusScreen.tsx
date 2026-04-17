import React, { useEffect, useState } from 'react'
import { FlatList } from 'react-native'
import { useI18n } from '@/app/i18n/useI18n'
import { useAppNav } from '@/app/navigation/useAppNav'
import { getSyncQueueSize, listSyncQueue, type SyncOp } from '@/core/cloud/syncQueueRepo'
import { Screen } from '@/ui/components/Screen'
import { Button, Card, EmptyState, ErrorState, Skeleton } from '@/ui/components/kit'
import { Box } from '@/ui/primitives'
import { Text } from '@/ui/components/Typography'
import { reportUiError } from '@/app/telemetry/report'

export default function SyncStatusScreen() {
  const { t } = useI18n()
  const nav = useAppNav()
  const [pending, setPending] = useState(0)
  const [ops, setOps] = useState<SyncOp[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [screenError, setScreenError] = useState<string | null>(null)
  const [successNotice, setSuccessNotice] = useState<string | null>(null)

  async function refresh(options?: { silent?: boolean }) {
    const silent = !!options?.silent
    if (!silent) setRefreshing(true)
    if (loading) setScreenError(null)

    try {
      const p = await getSyncQueueSize()
      const o = await listSyncQueue(50)
      setPending(p)
      setOps(o)
      setSuccessNotice(p === 0 ? `${t('sync.pending')}: 0` : t('sync.refresh'))
      setScreenError(null)
    } catch (e) {
      reportUiError(e, { kind: 'sync_status_refresh' })
      setScreenError(t('common.error'))
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh({ silent: true })
  }, [])

  return (
    <Screen
      background="gradient"
      title={t('sync.title')}
      subtitle={t('sync.subtitle')}
      onBack={() => nav.goBack()}
      style={{ flex: 1 }}
    >
      {loading ? (
        <Card tone="elevated" style={{ marginBottom: 12 }}>
          <Box style={{ gap: 10 }}>
            <Skeleton height={14} width="30%" />
            <Skeleton height={24} width="20%" />
            <Skeleton height={44} width="100%" />
          </Box>
        </Card>
      ) : null}

      {!loading && screenError ? (
        <ErrorState title={t('sync.title')} message={screenError} onRetry={() => void refresh()} />
      ) : null}

      {!loading && !screenError ? (
        <>
          <Card tone="elevated" style={{ marginBottom: 12 }}>
            <Box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <Box style={{ flex: 1, gap: 4 }}>
                <Text preset="caption">{t('sync.pending')}</Text>
                <Text preset="h2">{String(pending)}</Text>
              </Box>
              <Button text={refreshing ? t('common.ellipsis') : t('sync.refresh')} variant="ghost" onPress={() => void refresh()} disabled={refreshing} />
            </Box>
            {successNotice ? (
              <Box style={{ marginTop: 8 }}>
                <Text preset="caption">{successNotice}</Text>
              </Box>
            ) : null}
          </Card>

          {ops.length === 0 ? (
            <EmptyState title={t('sync.title')} message={t('sync.queue')} />
          ) : (
            <FlatList
              data={ops}
              keyExtractor={(o) => o.id}
              contentContainerStyle={{ paddingBottom: 24 }}
              ListHeaderComponent={<Text preset="muted" style={{ marginBottom: 10 }}>{t('sync.queue')}</Text>}
              renderItem={({ item }) => (
                <Card tone="default" style={{ marginBottom: 10 }}>
                  <Box style={{ gap: 4 }}>
                    <Text preset="body">{item.action.toUpperCase()} {item.kind}</Text>
                    <Text preset="muted" numberOfLines={1}>{item.entityId}</Text>
                    <Text preset="caption">{t('sync.tries', { tries: item.tries })}</Text>
                  </Box>
                </Card>
              )}
            />
          )}
        </>
      ) : null}
    </Screen>
  )
}
