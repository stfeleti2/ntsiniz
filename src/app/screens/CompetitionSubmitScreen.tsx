import React, { useEffect, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Alert } from 'react-native'

import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/kit'
import { ListRow } from '@/ui/components/kit/ListRow'
import { Box } from '@/ui'
import { t } from '@/app/i18n'
import { listClips } from '@/core/performance/clipsRepo'
import { ensureSelfPerson } from '@/core/social/peopleRepo'
import { upsertCompetitionSubmission } from '@/core/competitions/repo'
import { reportUiError } from '@/app/telemetry/report'

type Props = NativeStackScreenProps<RootStackParamList, 'CompetitionSubmit'>

export function CompetitionSubmitScreen({ navigation, route }: Props) {
  const { competitionId, roundId } = route.params
  const [clips, setClips] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    listClips(40)
      .then((c) => setClips(c))
      .catch((e) => reportUiError(e))
  }, [])

  const submit = async () => {
    if (!selectedId) return
    const me = await ensureSelfPerson()
    const clip = clips.find((c) => c.id === selectedId)
    if (!clip) return
    await upsertCompetitionSubmission({
      competitionId,
      roundId,
      userId: me.id,
      displayName: me.displayName,
      clipId: clip.id,
      score: clip.score,
      notes: null,
      source: 'self',
    })
    Alert.alert(t('competitions.submittedTitle'), t('competitions.submittedBody'))
    ;(navigation as any).replace('CompetitionLeaderboard', { competitionId, roundId })
  }

  return (
    <Screen scroll background="gradient">
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{t('competitions.submitTitle')}</Text>
        <Text preset="muted">{t('competitions.submitSubtitle')}</Text>
      </Box>

      <Card>
        <Text preset="h2">{t('competitions.pickClip')}</Text>
        <Text preset="muted">{t('competitions.pickClipHint')}</Text>
        <Box style={{ marginTop: 10, gap: 10 }}>
          {clips.length ? (
            clips.map((c) => (
              <ListRow
                key={c.id}
                title={c.title}
                subtitle={t('competitions.clipLine', { score: Math.round(c.score) })}
                leftIcon={selectedId === c.id ? '✅' : '🎬'}
                onPress={() => setSelectedId(c.id)}
              />
            ))
          ) : (
            <Text preset="muted">{t('competitions.noClips')}</Text>
          )}
        </Box>
      </Card>

      <Box style={{ gap: 10 }}>
        <Button text={t('competitions.submit')} disabled={!selectedId} onPress={() => submit().catch((e) => Alert.alert(t('common.error'), e?.message ?? t('common.error')))} />
        <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
      </Box>
    </Screen>
  )
}
