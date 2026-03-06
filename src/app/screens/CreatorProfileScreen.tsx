import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, Pressable, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { listPostsByAuthorWithStats } from '@/core/social/postsRepo'
import type { FeedPostWithStats } from '@/core/social/feedTypes'
import { useAppNav } from '@/app/navigation/useAppNav'
import { useI18n } from '@/app/i18n/useI18n'
import { ensureAuthedIdentity } from '@/core/cloud/identityRepo'
import { follow, isFollowing, unfollow } from '@/core/social/followsRepo'

export default function CreatorProfileScreen({ route }: any) {
  const { t } = useI18n()
  const nav = useAppNav()
  const { authorId, authorName } = route.params as { authorId: string; authorName?: string }

  const [me, setMe] = useState<{ userId: string; name: string } | null>(null)
  const [following, setFollowing] = useState(false)
  const [posts, setPosts] = useState<FeedPostWithStats[]>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const id = await ensureAuthedIdentity().catch(() => null)
      if (!mounted) return
      if (id) {
        setMe({ userId: id.userId, name: id.displayName })
        const f = await isFollowing(id.userId, authorId).catch(() => false)
        setFollowing(!!f)
      }
      const p = await listPostsByAuthorWithStats(authorId, 50).catch(() => [])
      if (!mounted) return
      setPosts(p)
    })()
    return () => {
      mounted = false
    }
  }, [authorId])

  const headerName = useMemo(() => authorName || posts[0]?.authorName || t('creator_profile.unknown'), [authorName, posts, t])

  async function toggleFollow() {
    if (!me) return
    if (following) {
      await unfollow(me.userId, authorId)
      setFollowing(false)
    } else {
      await follow(me.userId, authorId)
      setFollowing(true)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0B10' }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
        <Pressable onPress={() => nav.goBack()} style={{ paddingVertical: 8 }}>
          <Text style={{ color: '#9AA4B2' }}>{t('common.back')}</Text>
        </Pressable>
        <Text style={{ color: 'white', fontSize: 22, fontWeight: '700' }}>{headerName}</Text>
        <Text style={{ color: '#9AA4B2', marginTop: 6 }}>{t('creator_profile.subtitle')}</Text>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          <Pressable
            onPress={toggleFollow}
            style={{ backgroundColor: following ? '#1C2330' : '#2D6CDF', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 }}
            disabled={!me || me.userId === authorId}
          >
            <Text style={{ color: 'white', fontWeight: '700' }}>
              {following ? t('creator_profile.following') : t('creator_profile.follow')}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => nav.navigate('Session', { focusType: 'pitch', missionId: 'creator_start_journey' })}
            style={{ backgroundColor: '#1C2330', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 }}
          >
            <Text style={{ color: 'white', fontWeight: '700' }}>{t('creator_profile.start_journey')}</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ListEmptyComponent={
          <View style={{ paddingTop: 24 }}>
            <Text style={{ color: '#9AA4B2' }}>{t('creator_profile.no_posts')}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => nav.navigate('PostDetail', { postId: item.id })}
            style={{ backgroundColor: '#121826', borderRadius: 16, padding: 14, marginBottom: 12 }}
          >
            <Text style={{ color: 'white', fontWeight: '700' }}>{item.title}</Text>
            {!!item.body && <Text style={{ color: '#9AA4B2', marginTop: 6 }} numberOfLines={3}>{item.body}</Text>}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <Text style={{ color: '#9AA4B2' }}>{t('creator_profile.reactions', { count: item.stats?.reactions ?? 0 })}</Text>
              <Text style={{ color: '#9AA4B2' }}>{t('creator_profile.comments', { count: item.stats?.comments ?? 0 })}</Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  )
}
