import React, { useCallback, useState } from 'react'
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import type { MainTabParamList, RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/Card'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/Button'
import { ListRow } from '@/ui/components/kit/ListRow'
import { Box } from '@/ui'
import { t } from '@/app/i18n'

import { listFeedPostsWithStats } from '@/core/social/postsRepo'
import { listChallengeFeed, listDiscoverFeed, listJourneyFeed } from '@/core/social/feed'
import type { DiscoverFilter, FeedPostWithStats } from '@/core/social/feedTypes'
import { ensureSelfPerson } from '@/core/social/peopleRepo'
import { listFollowingIds } from '@/core/social/followsRepo'
import { isPersonBlocked } from '@/core/social/peopleRepo'
import { reportUiError } from '@/app/telemetry/report'
import { enablePerformanceModeV1 } from '@/core/config/flags'

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Community'>,
  NativeStackScreenProps<RootStackParamList>
>

export function CommunityScreen({ navigation }: Props) {
  const [posts, setPosts] = useState<FeedPostWithStats[]>([])
  const [tab, setTab] = useState<'journey' | 'challenge' | 'discover' | 'following'>('discover')
  const [discoverFilter, setDiscoverFilter] = useState<DiscoverFilter>('forYou')

  const refresh = async () => {
    const me = await ensureSelfPerson()
    const following = tab === 'following' ? new Set(await listFollowingIds(me.id).catch(() => [])) : null

    let all: FeedPostWithStats[] = []
    if (tab === 'journey') all = await listJourneyFeed(80)
    else if (tab === 'challenge') all = await listChallengeFeed(80)
    else if (tab === 'discover') all = await listDiscoverFeed(discoverFilter, 80, me.id)
    else {
      all = await listFeedPostsWithStats(120)
    }

    const out: FeedPostWithStats[] = []
    for (const p of all) {
      if (await isPersonBlocked(p.authorId).catch(() => false)) continue
      if (tab === 'following') {
        if (p.authorId !== me.id && !following?.has(p.authorId)) continue
      }
      out.push(p)
    }
    setPosts(out)
  }

  // Battery/perf: refresh only when screen is focused, not on a polling loop.
  useFocusEffect(
    useCallback(() => {
      refresh().catch((e) => reportUiError(e))
      return () => {}
    }, [tab, discoverFilter]),
  )

  const openStack = (name: string, params?: any) => (navigation as any).getParent?.()?.navigate?.(name, params)
  const performanceOn = enablePerformanceModeV1()

  return (
    <Screen scroll background="gradient">
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{t('community.title')}</Text>
        <Text preset="muted">{t('community.subtitle')}</Text>
      </Box>

      <Card tone="glow">
        <Text preset="h2">{t('community.actionsTitle')}</Text>
        <Text preset="muted">{t('community.actionsSubtitle')}</Text>
        <Box style={{ marginTop: 12, gap: 10 }}>
          {performanceOn ? <Button text={t('community.recordClip')} onPress={() => openStack('PerformanceMode')} /> : null}
          <Button text={t('community.createPost')} onPress={() => openStack('CreatePost')} />
          <Button text={t('community.importCode')} variant="soft" onPress={() => openStack('ImportCode')} />
          <Button text={t('community.openDuets')} variant="soft" onPress={() => openStack('DuetsHub')} />
          <Button text={t('community.openChallenges')} variant="ghost" onPress={() => openStack('ChallengesHub')} />
        </Box>
      </Card>

      <Card>
        <Text preset="h2">{t('community.feedTitle')}</Text>
        <Text preset="muted">{t('community.feedSubtitle')}</Text>
        <Box style={{ flexDirection: 'row', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
          <Button text={t('community.tabs.journey')} variant={tab === 'journey' ? 'primary' : 'soft'} onPress={() => setTab('journey')} />
          <Button text={t('community.tabs.challenge')} variant={tab === 'challenge' ? 'primary' : 'soft'} onPress={() => setTab('challenge')} />
          <Button text={t('community.tabs.discover')} variant={tab === 'discover' ? 'primary' : 'soft'} onPress={() => setTab('discover')} />
          <Button text={t('community.tabs.following')} variant={tab === 'following' ? 'primary' : 'soft'} onPress={() => setTab('following')} />
        </Box>

        {tab === 'discover' ? (
          <Box style={{ flexDirection: 'row', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
            <Button text={t('community.discoverFilters.forYou')} variant={discoverFilter === 'forYou' ? 'primary' : 'soft'} onPress={() => setDiscoverFilter('forYou')} />
            <Button text={t('community.discoverFilters.trending')} variant={discoverFilter === 'trending' ? 'primary' : 'soft'} onPress={() => setDiscoverFilter('trending')} />
            <Button text={t('community.discoverFilters.newCreators')} variant={discoverFilter === 'newCreators' ? 'primary' : 'soft'} onPress={() => setDiscoverFilter('newCreators')} />
          </Box>
        ) : null}

        <Text preset="muted" style={{ marginTop: 8 }}>
          {tab === 'following'
            ? t('community.followingHint')
            : tab === 'journey'
              ? t('community.journeyHint')
              : tab === 'challenge'
                ? t('community.challengeHint')
                : t('community.discoverHint')}
        </Text>
        <Box style={{ marginTop: 10, gap: 10 }}>
          {posts.length ? (
            posts.map((p) => (
              <ListRow
                key={p.id}
                title={p.title}
                subtitle={`${p.authorName} · ${new Date(p.createdAt).toLocaleDateString()} · ${t('community.statsLine', { reactions: p.stats.reactions, comments: p.stats.comments })}`}
                leftIcon={p.type === 'challenge' ? '🏁' : p.type === 'performance' ? '🎬' : '✨'}
                onPress={() => openStack('PostDetail', { postId: p.id })}
              />
            ))
          ) : (
            <Text preset="muted">{t('community.empty')}</Text>
          )}
        </Box>
      </Card>
    </Screen>
  )
}
