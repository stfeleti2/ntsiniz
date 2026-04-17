import React, { useEffect, useMemo, useState } from 'react'
import { FlatList } from 'react-native'
import { listPostsByAuthorWithStats } from '@/core/social/postsRepo'
import type { FeedPostWithStats } from '@/core/social/feedTypes'
import { useAppNav } from '@/app/navigation/useAppNav'
import { useI18n } from '@/app/i18n/useI18n'
import { ensureAuthedIdentity } from '@/core/cloud/identityRepo'
import { follow, isFollowing, unfollow } from '@/core/social/followsRepo'
import { Screen } from '@/ui/components/Screen'
import { Button, Card, EmptyState, ErrorState, Skeleton } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'
import { Box, SurfacePressable } from '@/ui/primitives'
import { reportUiError } from '@/app/telemetry/report'

export default function CreatorProfileScreen({ route }: any) {
  const { t } = useI18n()
  const nav = useAppNav()
  const { authorId, authorName } = route.params as { authorId: string; authorName?: string }

  const [me, setMe] = useState<{ userId: string; name: string } | null>(null)
  const [following, setFollowing] = useState(false)
  const [posts, setPosts] = useState<FeedPostWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [screenError, setScreenError] = useState<string | null>(null)
  const [followBusy, setFollowBusy] = useState(false)
  const [successNotice, setSuccessNotice] = useState<string | null>(null)

  async function loadProfile() {
    setLoading(true)
    setScreenError(null)
    try {
      const id = await ensureAuthedIdentity().catch(() => null)
      if (id) {
        setMe({ userId: id.userId, name: id.displayName })
        const f = await isFollowing(id.userId, authorId).catch(() => false)
        setFollowing(!!f)
      }
      const p = await listPostsByAuthorWithStats(authorId, 50).catch(() => [])
      setPosts(p)
    } catch (e) {
      reportUiError(e, { kind: 'creator_profile_load' })
      setScreenError(t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadProfile()
  }, [authorId])

  const headerName = useMemo(() => authorName || posts[0]?.authorName || t('creator_profile.unknown'), [authorName, posts, t])

  async function toggleFollow() {
    if (!me) return
    setFollowBusy(true)
    try {
      if (following) {
        await unfollow(me.userId, authorId)
        setFollowing(false)
      } else {
        await follow(me.userId, authorId)
        setFollowing(true)
      }
      setSuccessNotice(following ? t('common.back') : t('creator_profile.following'))
    } catch (e) {
      reportUiError(e, { kind: 'creator_profile_follow' })
      setScreenError(t('common.error'))
    } finally {
      setFollowBusy(false)
    }
  }

  return (
    <Screen
      background="gradient"
      title={headerName}
      subtitle={t('creator_profile.subtitle')}
      onBack={() => nav.goBack()}
      style={{ flex: 1 }}
    >
      {loading ? (
        <Card tone="elevated" style={{ marginBottom: 12 }}>
          <Box style={{ gap: 10 }}>
            <Skeleton height={24} width="60%" />
            <Skeleton height={44} width="100%" />
          </Box>
        </Card>
      ) : null}

      {!loading && screenError ? (
        <ErrorState title={headerName} message={screenError} onRetry={() => void loadProfile()} />
      ) : null}

      {!loading && !screenError ? (
        <>
          <Card tone="elevated" style={{ marginBottom: 12 }}>
            <Box style={{ gap: 10 }}>
              <Box style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                <Button
                  text={followBusy ? t('common.ellipsis') : following ? t('creator_profile.following') : t('creator_profile.follow')}
                  onPress={() => void toggleFollow()}
                  disabled={!me || me.userId === authorId || followBusy}
                  variant={following ? 'ghost' : 'primary-light-rounded'}
                />
                <Button
                  text={t('creator_profile.start_journey')}
                  variant="ghost"
                  onPress={() => nav.navigate('Session', { focusType: 'pitch', missionId: 'creator_start_journey' })}
                />
              </Box>
              {successNotice ? <Text preset="caption">{successNotice}</Text> : null}
            </Box>
          </Card>

          {posts.length === 0 ? (
            <EmptyState title={headerName} message={t('creator_profile.no_posts')} />
          ) : (
            <FlatList
              data={posts}
              keyExtractor={(p) => p.id}
              contentContainerStyle={{ paddingBottom: 24 }}
              renderItem={({ item }) => (
                <SurfacePressable
                  onPress={() => nav.navigate('PostDetail', { postId: item.id })}
                  style={{ padding: 14, marginBottom: 12 }}
                  elevation="raised"
                >
                  <Box style={{ gap: 6 }}>
                    <Text preset="body">{item.title}</Text>
                    {!!item.body ? (
                      <Text preset="muted" numberOfLines={3}>{item.body}</Text>
                    ) : null}
                    <Box style={{ flexDirection: 'row', gap: 10 }}>
                      <Text preset="caption">{t('creator_profile.reactions', { count: item.stats?.reactions ?? 0 })}</Text>
                      <Text preset="caption">{t('creator_profile.comments', { count: item.stats?.comments ?? 0 })}</Text>
                    </Box>
                  </Box>
                </SurfacePressable>
              )}
            />
          )}
        </>
      ) : null}
    </Screen>
  )
}
