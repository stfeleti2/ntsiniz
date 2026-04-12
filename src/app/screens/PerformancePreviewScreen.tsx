import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Alert, Image, Share, StyleSheet, View } from 'react-native'
import ViewShot from 'react-native-view-shot'
import { ResizeMode, Video } from 'expo-av'
import * as MediaLibrary from 'expo-media-library'
import * as Sharing from 'expo-sharing'

import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/kit'
import { Box } from '@/ui'
import { t } from '@/app/i18n'

import { getPerformanceTemplate } from '@/core/performance/templates'
import { getClipById, hideClip } from '@/core/performance/clipsRepo'
import { ensureSelfPerson } from '@/core/social/peopleRepo'
import { createPost } from '@/core/social/postsRepo'
import { createReport } from '@/core/mod/reportsRepo'
import { gradePhraseFromMetrics } from '@/core/scoring/phraseGrader'
import { markSharedWinForDay } from '@/core/retention/stateRepo'
import { dayKey } from '@/core/time/keys'
import { ShareCard } from '@/ui/share/ShareCard'
import { shareCapturedCard } from '@/ui/share/shareCardCapture'
import { reportUiError } from '@/app/telemetry/report'
import { getPublicLinks } from '@/core/config/links'


type Props = NativeStackScreenProps<RootStackParamList, 'PerformancePreview'>

export function PerformancePreviewScreen({ navigation, route }: Props) {
  const clipId = route.params.clipId
  const [clip, setClip] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)
  const [sharing, setSharing] = useState(false)

  const viewShotRef = useRef<any>(null)
  const shareCardRef = useRef<View | null>(null)

  const tpl = useMemo(() => (clip ? getPerformanceTemplate(clip.templateId) : null), [clip?.templateId])
  const links = useMemo(() => getPublicLinks(), []);

  const phraseGrade = useMemo(() => {
    if (!clip) return null
    return gradePhraseFromMetrics(clip.metrics, { difficulty: 'standard' })
  }, [clip])

  const refresh = async () => {
    const c = await getClipById(clipId)
    setClip(c)
  }

  useEffect(() => {
    refresh().catch((e) => reportUiError(e))
  }, [clipId])

  if (!clip) {
    return (
      <Screen scroll background="gradient">
        <Text preset="h1">{t('common.loading')}</Text>
        <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
      </Screen>
    )
  }

  const shareVideo = async () => {
    setSharing(true)
    try {
      if ((Sharing as any).isAvailableAsync && !(await (Sharing as any).isAvailableAsync())) {
        // Fallback to RN Share
        await Share.share({ url: clip.videoUri, message: t('performance.shareMessage', { score: Math.round(clip.score) }) } as any)
      } else {
        await (Sharing as any).shareAsync(clip.videoUri)
      }
      await markSharedWinForDay(dayKey(Date.now())).catch(() => null)
    } catch (e) {
      reportUiError(e)
    } finally {
      setSharing(false)
    }
  }

  const shareCover = async () => {
    setSharing(true)
    try {
      const uri = await viewShotRef.current?.capture?.()
      if (uri) await (Sharing as any).shareAsync(uri)
      await markSharedWinForDay(dayKey(Date.now())).catch(() => null)
    } catch (e) {
      reportUiError(e)
    } finally {
      setSharing(false)
    }
  }

  const shareCard = async () => {
    setSharing(true)
    try {
      if (shareCardRef.current) {
        await shareCapturedCard(shareCardRef.current, `ntsiniz-card-clip-${clipId}.png`)
        await markSharedWinForDay(dayKey(Date.now())).catch(() => null)
      }
    } catch (e) {
      reportUiError(e)
    } finally {
      setSharing(false)
    }
  }

  const saveToGallery = async () => {
    setSaving(true)
    try {
      const perm = await (MediaLibrary as any).requestPermissionsAsync?.()
      if (!perm?.granted) {
        Alert.alert(t('performance.permissionsTitle'), t('performance.galleryDenied'))
        return
      }
      const asset = await (MediaLibrary as any).createAssetAsync(clip.videoUri)
      try {
        await (MediaLibrary as any).createAlbumAsync('Ntsiniz', asset, false)
      } catch {}
      Alert.alert(t('performance.savedTitle'), t('performance.savedBody'))
    } catch (e) {
      reportUiError(e)
      Alert.alert(t('performance.errorTitle'), t('performance.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  const postToCommunity = async () => {
    try {
      const me = await ensureSelfPerson()
      await createPost({
        authorId: me.id,
        authorName: me.displayName,
        type: 'performance',
        title: t('performance.postTitle', { title: tpl?.title ?? clip.title }),
        body: t('performance.postBody', { score: Math.round(clip.score) }),
        payload: {
          clipId: clip.id,
          templateId: clip.templateId,
          score: clip.score,
          thumbnailUri: clip.thumbnailUri,
        },
        source: 'self',
        expiresAt: null,
      } as any)
      Alert.alert(t('performance.postedTitle'), t('performance.postedBody'))
      ;(navigation as any).navigate('MainTabs', { screen: 'Community' })
    } catch (e) {
      reportUiError(e)
      Alert.alert(t('performance.errorTitle'), t('performance.postFailed'))
    }
  }

  return (
    <Screen background="plain" style={{ padding: 0, gap: 0 }}>
      {/* Offscreen share card (captured via view-shot). */}
      <View
        ref={(r) => {
          shareCardRef.current = r
        }}
        collapsable={false}
        style={{ position: 'absolute', left: -5000, top: 0, width: 1080, height: 1080 }}
      >
        <ShareCard
          title={tpl?.title ?? clip.title}
          subtitle={phraseGrade ? `${t(`grading.label.${phraseGrade.label}` as any)} • ${t(`grading.reason.${phraseGrade.reasonKey}` as any)}` : t('performance.coverTagline')}
          badge={phraseGrade ? t(`grading.label.${phraseGrade.label}` as any) : undefined}
          scoreLabel={t('share.scoreLabel')}
          scoreValue={String(Math.round(clip.score ?? 0))}
          footer={links.appUrl ? `Get the app: ${links.appUrl}` : undefined}
        />
      </View>
      <View style={styles.wrap}>
        <View style={styles.playerWrap}>
          <Video
            source={{ uri: clip.videoUri }}
            style={styles.video}
            resizeMode={ResizeMode.COVER}
            useNativeControls
            shouldPlay={false}
          />

          <View pointerEvents="none" style={styles.badge}>
            <Text preset="body" style={{ fontWeight: '900' }}>{t('performance.scoreBadge', { score: Math.round(clip.score) })}</Text>
            {phraseGrade ? (
              <Text preset="muted" style={{ fontWeight: '900', marginTop: 2 }}>{t(`grading.label.${phraseGrade.label}` as any)}</Text>
            ) : null}
          </View>

          <View pointerEvents="none" style={styles.watermark}>
            <Text preset="muted" style={{ fontWeight: '900', opacity: 0.9 }}>{t('brand.name')}</Text>
          </View>
        </View>

        <View style={{ padding: 16, gap: 10 }}>
          <Card tone="glow">
            <Text preset="h2">{t('performance.previewTitle')}</Text>
            <Text preset="muted">{t('performance.previewSubtitle', { title: tpl?.title ?? clip.title })}</Text>
            <Text preset="muted">{t('performance.previewLine', { score: Math.round(clip.score), sec: Math.round(clip.durationMs / 1000) })}</Text>

            {phraseGrade ? (
              <Box style={{ marginTop: 10, gap: 4 }}>
                <Text preset="body" style={{ fontWeight: '900' }}>{t('grading.title')}</Text>
                <Text preset="muted">{t(`grading.reason.${phraseGrade.reasonKey}` as any)} • {t(`grading.cue.${phraseGrade.cueKey}` as any)}</Text>
              </Box>
            ) : null}

            <Box style={{ marginTop: 12, gap: 10 }}>
              <Button text={t('performance.shareVideo')} disabled={sharing} onPress={shareVideo} />
              <Button text={'Share card'} disabled={sharing} onPress={shareCard} />
              <Button text={t('performance.saveToGallery')} disabled={saving} variant="soft" onPress={saveToGallery} />
              <Button text={t('performance.postToCommunity')} variant="soft" onPress={postToCommunity} />
            </Box>
          </Card>

          <Card>
            <Text preset="h2">{t('performance.shareCoverTitle')}</Text>
            <Text preset="muted">{t('performance.shareCoverSubtitle')}</Text>

            <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }}>
              <View style={styles.coverWrap}>
                {clip.thumbnailUri ? (
                  <Image source={{ uri: clip.thumbnailUri }} style={styles.coverImg} />
                ) : (
                  <View style={[styles.coverImg, { backgroundColor: 'rgba(255,255,255,0.06)' }]} />
                )}

                <View style={styles.coverOverlay}>
                  <Text preset="h2">{tpl?.title ?? clip.title}</Text>
                  <Text preset="body" style={{ fontWeight: '900' }}>{t('performance.scoreBadge', { score: Math.round(clip.score) })}</Text>
                  <Text preset="muted">{t('performance.coverTagline')}</Text>
                </View>

                <View style={styles.coverWatermark}>
                  <Text preset="muted" style={{ fontWeight: '900' }}>{t('brand.name')}</Text>
                </View>
              </View>
            </ViewShot>

            <Box style={{ marginTop: 12 }}>
              <Button text={t('performance.shareCover')} variant="soft" disabled={sharing} onPress={shareCover} />
            </Box>
          </Card>

          <Box style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
            <Button
              text={t('performance.report')}
              variant="ghost"
              onPress={async () => {
                const me = await ensureSelfPerson()
                await createReport({
                  reporterId: me.id,
                  reporterName: me.displayName,
                  entityKind: 'clip',
                  entityId: clip.id,
                  reason: 'abuse',
                  notes: null,
                })
                Alert.alert(t('performance.reportedTitle'), t('performance.reportedBody'))
              }}
            />
            <Button
              text={t('performance.deleteClip')}
              variant="ghost"
              onPress={() => {
                Alert.alert(t('performance.deleteTitle'), t('performance.deleteBody'), [
                  { text: t('common.cancel'), style: 'cancel' },
                  {
                    text: t('performance.deleteConfirm'),
                    style: 'destructive',
                    onPress: async () => {
                      await hideClip(clip.id)
                      navigation.goBack()
                    },
                  },
                ])
              }}
            />
          </Box>
        </View>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  playerWrap: {
    width: '100%',
    aspectRatio: 9 / 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    left: 12,
    top: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  watermark: {
    position: 'absolute',
    right: 12,
    top: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  coverWrap: {
    width: '100%',
    height: 220,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  coverImg: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    gap: 4,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  coverWatermark: {
    position: 'absolute',
    right: 12,
    top: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
})
