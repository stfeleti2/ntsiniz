import React, { useMemo, useState } from 'react'
import { Alert } from 'react-native'

import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/Card'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/Button'
import { Box } from '@/ui'

import { listRecentAttempts, type Attempt } from '@/core/storage/attemptsRepo'
import { getSettings } from '@/core/storage/settingsRepo'
import { getProfile } from '@/core/storage/profileRepo'
import { loadPhase1Pack } from '@/core/drills/loader'
import { decodeWavSamples } from '@/app/audio/wavDecode'
import { analyzeSamplesForDrill } from '@/app/dev/repeatability'
import { t } from '@/core/i18n'

export function DevRepeatabilityScreen() {
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [selected, setSelected] = useState<Attempt | null>(null)
  const [running, setRunning] = useState(false)
  const [report, setReport] = useState<any>(null)

  const pack = useMemo(() => {
    try {
      return loadPhase1Pack()
    } catch {
      return null
    }
  }, [])

  const refresh = async () => {
    const rows = await listRecentAttempts(50)
    setAttempts(rows)
    if (!selected && rows[0]) setSelected(rows[0])
  }

  React.useEffect(() => {
    refresh().catch(() => {})
  }, [])

  const run = async () => {
    if (!selected) return
    const audioUri = (selected.metrics as any)?.audioUri
    if (!audioUri) {
      Alert.alert(t('dev.repeatability.noAudioTitle'), t('dev.repeatability.noAudioBody'))
      return
    }

    const drill = pack?.drills?.find((d) => d.id === selected.drillId)
    if (!drill) {
      Alert.alert(t('dev.repeatability.drillNotFoundTitle'), t('dev.repeatability.drillNotFoundBody', { id: selected.drillId }))
      return
    }

    setRunning(true)
    setReport(null)
    try {
      const decoded = await decodeWavSamples(audioUri)
      if (!decoded) {
        Alert.alert(t('dev.repeatability.decodeFailedTitle'), t('dev.repeatability.decodeFailedBody'))
        return
      }

      const settings = await getSettings()
      const profile = await getProfile()

      const N = 10
      const runs = [] as any[]
      for (let i = 0; i < N; i++) {
        runs.push(
          analyzeSamplesForDrill({
            drill,
            settings,
            profile,
            sampleRate: decoded.sampleRate,
            samples: decoded.samples,
          }),
        )
      }

      const scores = runs.map((r) => r.score)
      const min = Math.min(...scores)
      const max = Math.max(...scores)
      const mean = scores.reduce((a, b) => a + b, 0) / Math.max(1, scores.length)
      const variance = scores.reduce((a, b) => a + (b - mean) * (b - mean), 0) / Math.max(1, scores.length)
      const std = Math.sqrt(variance)

      setReport({
        attemptId: selected.id,
        drillId: selected.drillId,
        audioUri,
        N,
        min,
        max,
        mean,
        std,
        runs,
      })
    } finally {
      setRunning(false)
    }
  }

  return (
    <Screen scroll background="gradient">
      <Box style={{ gap: 8 }}>
        <Text preset="h1">{t('dev.repeatability.title')}</Text>
        <Text preset="muted">{t('dev.repeatability.subtitle')}</Text>
      </Box>

      <Card>
        <Text preset="h2">{t('dev.repeatability.selectAttempt')}</Text>
        <Text preset="muted">{t('dev.repeatability.selectAttemptHint')}</Text>
        <Box style={{ gap: 10, marginTop: 12 }}>
          <Button text={t('dev.repeatability.refreshAttempts')} variant="soft" onPress={() => refresh().catch(() => {})} />
          {attempts.slice(0, 12).map((a) => {
            const hasAudio = !!(a.metrics as any)?.audioUri
            const active = selected?.id === a.id
            return (
              <Button
                key={a.id}
                text={`${active ? t('dev.repeatability.selectedMark') + ' ' : ''}${a.drillId} · ${a.score}${hasAudio ? '' : ' ' + t('dev.repeatability.noAudioTag')}`}
                variant={active ? 'primary' : 'ghost'}
                onPress={() => setSelected(a)}
              />
            )
          })}
        </Box>
      </Card>

      <Card>
        <Text preset="h2">{t('dev.repeatability.runTitle')}</Text>
        <Text preset="muted">{t('dev.repeatability.runHint')}</Text>
        <Box style={{ marginTop: 12 }}>
          <Button text={running ? t('dev.repeatability.running') : t('dev.repeatability.run')} onPress={() => run().catch(() => {})} disabled={running} />
        </Box>

        {report ? (
          <Box style={{ marginTop: 12, gap: 6 }}>
            <Text preset="h2">{t('dev.repeatability.reportTitle')}</Text>
            <Text preset="muted">{t('dev.repeatability.reportN', { n: report.N })}</Text>
            <Text preset="muted">{t('dev.repeatability.reportMinMax', { min: report.min, max: report.max })}</Text>
            <Text preset="muted">{t('dev.repeatability.reportMeanStd', { mean: report.mean.toFixed(2), std: report.std.toFixed(3) })}</Text>
            <Text preset="muted">{t('dev.repeatability.tip')}</Text>
          </Box>
        ) : null}
      </Card>
    </Screen>
  )
}
