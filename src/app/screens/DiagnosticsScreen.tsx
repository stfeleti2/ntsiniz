import React, { useEffect, useState } from 'react'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/Card'
import { Text } from '@/ui/components/Typography'
import { Box } from '@/ui'
import { t } from '@/app/i18n'
import { subscribePerf, type PerfSnapshot } from '@/core/perf/perfMonitor'
import { getQualityState, subscribeQuality } from '@/core/perf/qualityRuntime'
import { isCloudConfigured, getCloudConfig } from '@/core/cloud/config'
import {
  enableCloud,
  enableSocial,
  enableDuets,
  enableCompetitions,
  enableMarketplace,
  getDisabledCompetitionIds,
  getDisabledDrillIds,
  getDisabledLessonIds,
  getDisabledPackIds,
  maxAppVersion,
  minAppVersion,
  requireManifestSignature,
} from '@/core/config/flags'
import { getAppVersion } from '@/core/config/appVersion'
import { getManifestSignatureStatus } from '@/core/content/manifest'

export function DiagnosticsScreen({ navigation }: any) {
  const [perf, setPerf] = useState<PerfSnapshot | null>(null)
  const [quality, setQuality] = useState(() => getQualityState())

  useEffect(() => {
    const unsubPerf = subscribePerf((s) => setPerf(s))
    const unsubQ = subscribeQuality((q) => setQuality(q))
    return () => {
      unsubPerf()
      unsubQ()
    }
  }, [])

  const cloudEnabled = enableCloud()
  const cloudConfigured = isCloudConfigured()
  const cfg = getCloudConfig()

  const blockedPacks = getDisabledPackIds()
  const blockedDrills = getDisabledDrillIds()
  const blockedLessons = getDisabledLessonIds()
  const blockedCompetitions = getDisabledCompetitionIds()

  const appVersion = getAppVersion()
  const minV = minAppVersion()
  const maxV = maxAppVersion()
  const sigStatus = getManifestSignatureStatus()

  return (
    <Screen scroll background="gradient">
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{t('settings.openDiagnostics')}</Text>
        <Text preset="muted">{t('diagnostics.subtitle')}</Text>
        <Text preset="muted" onPress={() => navigation?.goBack?.()}>{t('common.back')}</Text>
      </Box>

      <Card tone="elevated">
        <Text preset="h2">{t('diagnostics.qualityTitle')}</Text>
        <Text preset="muted">
          {t('diagnostics.mode')}: {quality.mode} ({t('diagnostics.resolved')}: {quality.resolved})
        </Text>
        <Text preset="muted">{t('diagnostics.tier')}: {quality.tier}</Text>
        <Text preset="muted">{t('diagnostics.bgInterval')}: {quality.config.backgroundWorkIntervalMs}ms</Text>
        <Text preset="muted">{t('diagnostics.pitchFps')}: {quality.config.pitchMaxFramesPerSecond}</Text>
        <Text preset="muted">{t('diagnostics.overlay')}: {quality.config.enableOverlays ? t('common.on') : t('common.off')}</Text>
      </Card>

      <Card>
        <Text preset="h2">{t('diagnostics.perfTitle')}</Text>
        <Text preset="muted">{t('diagnostics.stalls')}: {perf?.stalls ?? 0}</Text>
        <Text preset="muted">{t('diagnostics.lastStall')}: {perf?.lastStallMs ?? 0}ms</Text>
        <Text preset="muted">{t('diagnostics.worstStall')}: {perf?.worstStallMs ?? 0}ms</Text>
        <Text preset="muted">{t('diagnostics.p95Stall')}: {perf?.p95StallMs ?? 0}ms</Text>
        <Text preset="muted">{t('diagnostics.frameQueue')}: {perf?.frameBusQueue ?? 0}</Text>
        <Text preset="muted">{t('diagnostics.frameDropped')}: {perf?.frameBusDropped ?? 0}</Text>
      </Card>

      {__DEV__ ? (
        <Card tone="glow">
          <Text preset="h2">{t('diagnostics.devTools', 'Dev tools')}</Text>
          <Text preset="muted" onPress={() => navigation?.navigate?.('AudioTortureLab')}>
            {t('diagnostics.openAudioTortureLab', 'Open Audio Torture Lab →')}
          </Text>
        </Card>
      ) : null}

      <Card tone="glow">
        <Text preset="h2">{t('diagnostics.flagsTitle')}</Text>
        <Text preset="muted">
          {t('diagnostics.cloud')}: {cloudEnabled ? t('common.on') : t('common.off')} ({t('diagnostics.configured')}: {cloudConfigured ? t('common.on') : t('common.off')})
        </Text>
        <Text preset="muted">{t('diagnostics.social')}: {enableSocial() ? t('common.on') : t('common.off')}</Text>
        <Text preset="muted">{t('diagnostics.duets')}: {enableDuets() ? t('common.on') : t('common.off')}</Text>
        <Text preset="muted">{t('diagnostics.competitions')}: {enableCompetitions() ? t('common.on') : t('common.off')}</Text>
        <Text preset="muted">{t('diagnostics.marketplace')}: {enableMarketplace() ? t('common.on') : t('common.off')}</Text>
      </Card>

      <Card>
        <Text preset="h2">{t('diagnostics.blockedTitle')}</Text>
        <Text preset="muted">
          {t('diagnostics.blockedPacks')}: {blockedPacks.length ? blockedPacks.join(', ') : '—'}
        </Text>
        <Text preset="muted">
          {t('diagnostics.blockedDrills')}: {blockedDrills.length ? blockedDrills.join(', ') : '—'}
        </Text>
        <Text preset="muted">
          {t('diagnostics.blockedLessons')}: {blockedLessons.length ? blockedLessons.join(', ') : '—'}
        </Text>
        <Text preset="muted">
          {t('diagnostics.blockedCompetitions')}: {blockedCompetitions.length ? blockedCompetitions.join(', ') : '—'}
        </Text>
      </Card>

      <Card>
        <Text preset="h2">{t('diagnostics.compatTitle')}</Text>
        <Text preset="muted">{t('diagnostics.appVersion')}: {appVersion}</Text>
        <Text preset="muted">{t('diagnostics.minApp')}: {minV ?? '—'}</Text>
        <Text preset="muted">{t('diagnostics.maxApp')}: {maxV ?? '—'}</Text>
      </Card>

      <Card>
        <Text preset="h2">{t('diagnostics.signatureTitle')}</Text>
        <Text preset="muted">{t('diagnostics.signatureStatus')}: {sigStatus}</Text>
        <Text preset="muted">{t('diagnostics.signatureRequired')}: {requireManifestSignature() ? t('common.on') : t('common.off')}</Text>
      </Card>

      <Card>
        <Text preset="h2">{t('diagnostics.cloudTitle')}</Text>
        <Text preset="muted">{t('diagnostics.autosync')}: {cfg.cloudAutoSync ? t('common.on') : t('common.off')}</Text>
        <Text preset="muted">{t('diagnostics.endpointSet')}: {cfg.supabaseUrl ? t('common.on') : t('common.off')}</Text>
        <Text preset="muted">{t('diagnostics.anonKeySet')}: {cfg.supabaseAnonKey ? t('common.on') : t('common.off')}</Text>
      </Card>

      <Text preset="muted">{t('diagnostics.tip')}</Text>
    </Screen>
  )
}
