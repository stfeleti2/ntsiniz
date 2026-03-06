import React, { useEffect, useState } from 'react'
import { View, Text, Pressable, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useI18n } from '@/app/i18n/useI18n'
import { useAppNav } from '@/app/navigation/useAppNav'
import { getSyncQueueSize, listSyncQueue, type SyncOp } from '@/core/cloud/syncQueueRepo'

export default function SyncStatusScreen() {
  const { t } = useI18n()
  const nav = useAppNav()
  const [pending, setPending] = useState(0)
  const [ops, setOps] = useState<SyncOp[]>([])

  async function refresh() {
    const p = await getSyncQueueSize().catch(() => 0)
    const o = await listSyncQueue(50).catch(() => [])
    setPending(p)
    setOps(o)
  }

  useEffect(() => {
    refresh()
  }, [])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0B10' }}>
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <Pressable onPress={() => nav.goBack()} style={{ paddingVertical: 6 }}>
          <Text style={{ color: '#9AA4B2' }}>{t('common.back')}</Text>
        </Pressable>
        <Text style={{ color: 'white', fontSize: 22, fontWeight: '800' }}>{t('sync.title')}</Text>
        <Text style={{ color: '#9AA4B2', marginTop: 6 }}>{t('sync.subtitle')}</Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <View style={{ backgroundColor: '#121826', borderRadius: 14, padding: 12, flex: 1, marginRight: 10 }}>
            <Text style={{ color: '#9AA4B2', fontSize: 12 }}>{t('sync.pending')}</Text>
            <Text style={{ color: 'white', fontSize: 20, fontWeight: '800', marginTop: 4 }}>{pending}</Text>
          </View>
          <Pressable onPress={refresh} style={{ backgroundColor: '#1C2330', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14 }}>
            <Text style={{ color: 'white', fontWeight: '800' }}>{t('sync.refresh')}</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={ops}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ListHeaderComponent={<Text style={{ color: '#9AA4B2', marginBottom: 10 }}>{t('sync.queue')}</Text>}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: '#121826', borderRadius: 16, padding: 12, marginBottom: 10 }}>
            <Text style={{ color: 'white', fontWeight: '700' }}>{item.action.toUpperCase()} {item.kind}</Text>
            <Text style={{ color: '#9AA4B2', marginTop: 4 }} numberOfLines={1}>{item.entityId}</Text>
            <Text style={{ color: '#4B5565', marginTop: 6, fontSize: 12 }}>{t('sync.tries', { tries: item.tries })}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  )
}
