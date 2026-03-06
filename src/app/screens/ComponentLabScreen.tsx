import React, { useMemo, useRef, useState } from 'react'
import { ScrollView } from 'react-native'
import { t } from '@/app/i18n'
import { ThemeProvider } from '@/ui/theme'
import { theme } from '@/ui/theme/theme'
import { Box, Stack, Text, Divider } from '@/ui/primitives'
import {
  Button,
  IconButton,
  Input,
  Card,
  Badge,
  ListRow,
  EmptyState,
  ErrorState,
  Skeleton,
} from '@/ui/components/kit'
import { RecordingOverlay, RecorderHUD, PlaybackOverlay, WaveformCard, TakeBadge, WaveformSeek } from '@/ui/patterns'
import {
  AttemptWaveformList,
  getDevModuleRegistry,
  useDevModules,
  HomeHeroModule,
  HomeRecommendedModule,
  JourneyHeaderModule,
  JourneyNextUpModule,
  SessionRowModule,
  SessionSummaryModule,
  ResultsScoreModule,
  ResultsShareModule,
  ScoreKpiRowModule,
  ShareActionsModule,
  SectionHeaderModule,
  InlineStatModule,
  PrimaryActionBarModule,
  JourneyNextUpMissionModule,
  JourneyTabsModule,
  AttemptListCompactModule,
  AttemptListDetailedModule,
  WaveformPlayerModule,
} from '@/ui/modules'

export function ComponentLabScreen() {
  const devModules = useDevModules()
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [error, setError] = useState(false)
  const [text, setText] = useState('')
  const [overlay, setOverlay] = useState(false)
  const [paused, setPaused] = useState(false)

  const shareCardRef = useRef<any>(null)

  const helper = useMemo(() => (error ? t('dev.errorText') : t('dev.helperText')), [error])

  const mockAttempts = useMemo(
    () =>
      [
        { id: 'a1', sessionId: 's1', drillId: 'warmup', score: 72, createdAt: Date.now() - 1000 * 60 * 60, metrics: {} },
        { id: 'a2', sessionId: 's1', drillId: 'intervals', score: 84, createdAt: Date.now() - 1000 * 60 * 20, metrics: {} },
        { id: 'a3', sessionId: 's1', drillId: 'echo', score: 79, createdAt: Date.now() - 1000 * 60 * 5, metrics: {} },
      ] as any,
    [],
  )

  return (
    <ThemeProvider theme={theme}>
      <ScrollView contentInsetAdjustmentBehavior="always">
        <Box style={{ padding: 16 }}>
          <Text size="xl" weight="bold">
            {t('dev.componentLab')}
          </Text>

          <Box style={{ height: 16 }} />

          <Card>
            <Text weight="bold">{t('dev.states')}</Text>
            <Box style={{ height: 12 }} />
            <Stack direction="horizontal" gap={12}>
              <Button
                label={loading ? t('dev.loadingOn') : t('dev.loadingOff')}
                variant="secondary"
                onPress={() => setLoading(!loading)}
              />
              <Button
                label={disabled ? t('dev.disabledOn') : t('dev.disabledOff')}
                variant="secondary"
                onPress={() => setDisabled(!disabled)}
              />
            </Stack>
            <Box style={{ height: 12 }} />
            <Stack direction="horizontal" gap={12}>
              <Button
                label={error ? t('dev.errorOn') : t('dev.errorOff')}
                variant="secondary"
                onPress={() => setError(!error)}
              />
              <Button
                label={overlay ? t('dev.hideOverlay') : t('dev.showOverlay')}
                variant="secondary"
                onPress={() => setOverlay(!overlay)}
              />
            </Stack>
          </Card>

          <Box style={{ height: 16 }} />

          <Text size="lg" weight="bold">
            {t('dev.moduleToggles')}
          </Text>
          <Box style={{ height: 8 }} />
          <Card>
            <Stack gap={10}>
              <Text tone="muted" size="sm">
                {t('dev.moduleTogglesHint')}
              </Text>
              {getDevModuleRegistry().map((m) => {
                const enabled = !!devModules.enabled[m.key]
                return (
                  <Box key={m.key} style={{ gap: 6 }}>
                    <Stack direction="horizontal" gap={10} align="center" justify="space-between">
                      <Box style={{ flex: 1 }}>
                        <Text weight="bold">{m.title}</Text>
                        <Text tone="muted" size="sm">
                          {m.description}
                        </Text>
                      </Box>
                      <Button
                        label={enabled ? t('common.on') : t('common.off')}
                        variant={enabled ? 'primary' : 'secondary'}
                        onPress={() => devModules.setEnabled(m.key, !enabled)}
                        testID={`lab.toggle.${m.key}`}
                      />
                    </Stack>
                    <Divider />
                  </Box>
                )
              })}
              <Button label={t('dev.resetToggles')} variant="ghost" onPress={devModules.reset} />
            </Stack>
          </Card>

          <Box style={{ height: 16 }} />

          <Text size="lg" weight="bold">
            {t('dev.foundations')}
          </Text>
          <Box style={{ height: 8 }} />
          <Card>
            <Text tone="muted" size="sm">{t('dev.tokensPreview')}</Text>
            <Box style={{ height: 12 }} />
            <Stack direction="horizontal" gap={12} align="center">
              <Badge label={t('dev.primary')} />
              <Badge label={t('dev.success')} tone="success" />
              <Badge label={t('dev.danger')} tone="danger" />
              <Badge label={t('dev.warning')} tone="warning" />
            </Stack>
            <Box style={{ height: 12 }} />
            <Divider />
            <Box style={{ height: 12 }} />
            <Skeleton height={14} />
          </Card>

          <Box style={{ height: 16 }} />

          <Text size="lg" weight="bold">
            {t('dev.components')}
          </Text>
          <Box style={{ height: 8 }} />

          <Card>
            <Stack gap={12}>
              <Stack direction="horizontal" gap={12} align="center">
                <Button label={t('dev.primary')} loading={loading} disabled={disabled} onPress={() => {}} />
                <Button label={t('dev.ghost')} variant="ghost" loading={loading} disabled={disabled} onPress={() => {}} />
                <IconButton icon="★" onPress={() => {}} disabled={disabled} />
              </Stack>

              <Input
                value={text}
                onChangeText={setText}
                placeholder={t('dev.placeholderType')}
                label={t('dev.inputLabel')}
                helperText={!error ? helper : undefined}
                errorText={error ? t('dev.errorText') : undefined}
                disabled={disabled}
                testID="lab.input"
              />

              <ListRow title={t('dev.rowTitle')} subtitle={t('dev.rowSubtitle')} leftIcon="♪" onPress={() => {}} disabled={disabled} />

              <EmptyState title={t('dev.emptyTitle')} message={t('dev.emptyMessage')} />
              <ErrorState title={t('dev.errorTitle')} message={t('dev.errorMessage')} onRetry={() => {}} />
            </Stack>
          </Card>

          <Box style={{ height: 16 }} />

          <Text size="lg" weight="bold">
            {t('dev.patterns')}
          </Text>
          <Box style={{ height: 8 }} />

          <Card>
            <Stack gap={12}>
              <WaveformCard title={t('dev.take1')} subtitle={t('dev.warmup')} statusLabel={t('dev.ready')}>
                <WaveformSeek
                  peaks={[5, 12, 18, 20, 44, 65, 80, 72, 60, 40, 22, 18, 35, 55, 70, 86, 90, 68, 45, 25, 15, 10]}
                  progress={0.42}
                  onSeek={() => {}}
                  height={82}
                  testID="lab.waveform"
                />
              </WaveformCard>
              <Stack direction="horizontal" gap={12}>
                <TakeBadge status="best" />
                <TakeBadge status="saved" />
                <TakeBadge status="new" />
              </Stack>
              <RecorderHUD elapsedLabel="00:12" />
              <PlaybackOverlay isPlaying={false} progressLabel={t('dev.progress')} onToggle={() => {}} />
            </Stack>
          </Card>

          <Box style={{ height: 16 }} />

          <Text size="lg" weight="bold">
            {t('dev.modules')}
          </Text>
          <Box style={{ height: 8 }} />
          <Card>
            <Stack gap={12}>
              <Text tone="muted" size="sm">
                {t('dev.modulesHint')}
              </Text>

              <Text weight="bold">{t('dev.modulesRegistry.homeHeroTitle')}</Text>
              <HomeHeroModule
                stats={{ streakDays: 4, lastScore: 72, last7Avg: 68, bestScore: 88 }}
                onStartSession={() => {}}
                onOpenTuner={() => {}}
                testID="lab.module.homeHero"
              />

              <Text weight="bold">{t('dev.modulesRegistry.homeRecommendedTitle')}</Text>
              <HomeRecommendedModule
                mission={{ id: 'm1', title: t('dev.sampleMissionTitle'), subtitle: t('dev.sampleMissionSubtitle') }}
                onStartMission={() => {}}
                onOpenJourney={() => {}}
                testID="lab.module.homeRecommended"
              />

              <Text weight="bold">{t('dev.modulesRegistry.journeyHeaderTitle')}</Text>
              <JourneyHeaderModule tab="map" onTab={() => {}} testID="lab.module.journeyHeader" />

              <Text weight="bold">{t('dev.modulesRegistry.journeyNextUpTitle')}</Text>
              <JourneyNextUpModule
                progress={{ done: 3, total: 10, pct: 0.3 }}
                mission={{ id: 'm1', title: t('dev.sampleMission2Title'), subtitle: t('dev.sampleMission2Subtitle') }}
                onStartMission={() => {}}
                testID="lab.module.journeyNextUp"
              />

              <Text weight="bold">{t('dev.modulesRegistry.journeyNextUpMissionTitle')}</Text>
              <Card>
                <JourneyNextUpMissionModule
                  mission={{ id: 'm1', title: t('dev.sampleMission2Title'), subtitle: t('dev.sampleMission2Subtitle'), focus: t('dev.sampleFocus'), drills: [t('dev.sampleDrillWarmup'), t('dev.sampleDrillEcho')] }}
                  testID="lab.module.journeyNextUpMission"
                />
              </Card>

              <Text weight="bold">{t('dev.modulesRegistry.journeySessionRowTitle')}</Text>
              <SessionRowModule
                session={{ id: 's1', startedAt: Date.now() - 1000 * 60 * 60 * 24, avgScore: 82, attemptCount: 3 }}
                onPress={() => {}}
                testID="lab.module.sessionRow"
              />

              <Text weight="bold">{t('dev.modulesRegistry.sessionSummaryTitle')}</Text>
              <SessionSummaryModule
                recommendedTitle={t('dev.sampleMissionTitle')}
                primaryLabel={t('session.start')}
                onPrimary={() => {}}
                planItems={[
                  { id: 'p1', label: t('dev.samplePlan1'), isDone: true },
                  { id: 'p2', label: t('dev.samplePlan2'), isCurrent: true },
                ]}
                testID="lab.module.sessionSummary"
              />

              <Text weight="bold">{t('dev.modulesRegistry.resultsScoreTitle')}</Text>
              <ResultsScoreModule
                score={84}
                deltaValue={'+6'}
                milestones={{ day7: '78 (Feb 01, 2026)', day30: '70 (Jan 10, 2026)' }}
                testID="lab.module.resultsScore"
              />

              <Text weight="bold">{t('dev.modulesRegistry.resultsShareTitle')}</Text>
              <ResultsShareModule
                cardRef={shareCardRef}
                scoreNow={84}
                delta={6}
                onShare={() => {}}
                toast={t('results.shared')}
                testID="lab.module.resultsShare"
              />

              <Text weight="bold">{t('dev.shared.scoreKpiRow')}</Text>
              <Card>
                <Stack gap={8}>
                  <ScoreKpiRowModule label={t('results.baselineLabel')} value={t('results.deltaShort', { delta: 6 })} testID="lab.module.kpi" />
                  <ScoreKpiRowModule label={t('results.day7Label')} value="78 (Feb 01, 2026)" />
                </Stack>
              </Card>

              <Text weight="bold">{t('dev.shared.shareActions')}</Text>
              <Card>
                <ShareActionsModule primaryLabel={t('results.share')} onPrimary={() => {}} toast={t('results.shared')} testID="lab.module.shareActions" />
              </Card>

              <Text weight="bold">{t('dev.shared.sectionHeader')}</Text>
              <Card>
                <SectionHeaderModule title={t('dev.sampleSectionTitle')} subtitle={t('dev.sampleSectionSubtitle')} actionLabel={t('dev.seeAll')} onActionPress={() => {}} />
              </Card>

              <Text weight="bold">{t('dev.shared.inlineStat')}</Text>
              <Card>
                <Stack gap={8}>
                  <InlineStatModule label={t('dev.statLabel')} value={t('dev.statValue')} />
                  <InlineStatModule label={t('dev.statLabel2')} value={t('dev.statValue2')} emphasis="strong" />
                </Stack>
              </Card>

              <Text weight="bold">{t('dev.shared.primaryActionBar')}</Text>
              <PrimaryActionBarModule primaryLabel={t('common.continue')} onPrimaryPress={() => {}} secondaryLabel={t('common.cancel')} onSecondaryPress={() => {}} />

              <Text weight="bold">{t('dev.modulesRegistry.journeyTabsTitle')}</Text>
              <JourneyTabsModule
                tabs={[{ key: 'map', label: t('journey.tabs.map') }, { key: 'proof', label: t('journey.tabs.proof') }]}
                activeKey="map"
                onChange={() => {}}
                testID="lab.module.journeyTabs"
              />

              <Text weight="bold">{t('dev.modulesRegistry.attemptListCompactTitle')}</Text>
              <AttemptListCompactModule attempts={mockAttempts} testID="lab.module.attemptListCompact" />

              <Text weight="bold">{t('dev.modulesRegistry.attemptListDetailedTitle')}</Text>
              <AttemptListDetailedModule attempts={mockAttempts} testID="lab.module.attemptListDetailed" />

              <Text weight="bold">{t('dev.modulesRegistry.waveformPlayerTitle')}</Text>
              <WaveformPlayerModule
                testID="lab.module.waveformPlayer"
                loading={false}
                peaks={new Array(96).fill(0).map((_, i) => Math.round(Math.abs(Math.sin(i * 0.33)) * 100))}
                progress={0.32}
                progressLabel="00:18 / 00:56"
                isPlaying={loading}
                onToggle={() => setLoading((v) => !v)}
                onRestart={() => {}}
                onSeek={() => {}}
              />

              <AttemptWaveformList attempts={mockAttempts} testID="lab.attemptWaveformList" />
            </Stack>
          </Card>
        </Box>

        <RecordingOverlay
          visible={overlay}
          mode="full"
          elapsedLabel="00:12"
          paused={paused}
          onStop={() => {
            setOverlay(false)
            setPaused(false)
          }}
          onPause={() => setPaused(true)}
          onResume={() => setPaused(false)}
          onMinimize={() => setOverlay(false)}
          testID="lab.recordingOverlay"
        />
      </ScrollView>
    </ThemeProvider>
  )
}
