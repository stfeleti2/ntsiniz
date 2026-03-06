import React, { useEffect, useMemo, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Alert, Share, Pressable } from 'react-native'

import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/Card'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/Button'
import { Input } from '@/ui/components/kit/Input'
import { ListRow } from '@/ui/components/kit/ListRow'
import { Box } from '@/ui'
import { useSnackbar } from '@/ui/components/kit/Snackbar'
import { t } from '@/app/i18n'
import { formatDate } from '@/core/i18n'

import { ensureSelfPerson, setBlocked } from '@/core/social/peopleRepo'
import { follow, unfollow, isFollowing } from '@/core/social/followsRepo'
import { addComment, getPostById, hidePost, listComments, listReactions, setReaction } from '@/core/social/postsRepo'
import { validateComment } from '@/core/social/moderation'
import { createMyPostCode } from '@/core/social/shareCode'
import { createReport } from '@/core/mod/reportsRepo'
import { reportUiError } from '@/app/telemetry/report'

type Props = NativeStackScreenProps<RootStackParamList, 'PostDetail'>

const REACTIONS = ['🔥', '👏', '💯', '❤️']

export function PostDetailScreen({ navigation, route }: Props) {
  const snackbar = useSnackbar()
  const [post, setPost] = useState<any | null>(null)
  const [comments, setComments] = useState<any[]>([])
  const [reactions, setReactions] = useState<any[]>([])
  const [text, setText] = useState('')
  const [following, setFollowing] = useState(false)
  const [meId, setMeId] = useState<string | null>(null)

  const postId = route.params.postId

  const refresh = async () => {
    const p = await getPostById(postId)
    setPost(p)
    setComments(await listComments(postId))
    setReactions(await listReactions(postId))
    if (p) {
      const me = await ensureSelfPerson()
      setMeId(me.id)
      setFollowing(p.authorId !== me.id ? await isFollowing(me.id, p.authorId).catch(() => false) : false)
    }
  }

  useEffect(() => {
    refresh().catch((e) => reportUiError(e))
  }, [postId])

  const reactionCounts = useMemo(() => {
    const map: Record<string, number> = {}
    for (const r of reactions) map[r.reaction] = (map[r.reaction] ?? 0) + 1
    return map
  }, [reactions])

  if (!post) {
    return (
      <Screen scroll background="gradient">
        <Text preset="h1">{t('post.loading')}</Text>
        <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
      </Screen>
    )
  }

  const shareThis = async () => {
    const code = await createMyPostCode({
      type: post.type,
      title: post.title,
      body: post.body,
      payload: post.payload,
      expiresAt: post.expiresAt ?? null,
    } as any)
    const link = `ntsiniz://import?code=${code}`
    await Share.share({ message: `${t('share.postIntro')}\n${link}\n\n${t('share.codeFallback')}\n${code}` })
  }

  return (
    <Screen scroll background="gradient">
      <Card tone="glow">
        <Text preset="h2">{post.title}</Text>
        <Pressable
          onPress={() => (navigation as any).navigate('CreatorProfile', { authorId: post.authorId, authorName: post.authorName })}
          style={{ alignSelf: 'flex-start' }}
        >
          <Text preset="muted">{`${post.authorName} · ${formatDate(post.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}`}</Text>
        </Pressable>
        {post.body ? <Text preset="body" style={{ marginTop: 10 }}>{post.body}</Text> : null}

        {post.type === 'performance' ? (
          <Box style={{ marginTop: 12, gap: 8 }}>
            <Text preset="muted">{t('performance.postDetailLine', { score: Math.round(post.payload?.score ?? 0) })}</Text>
            {post.payload?.clipId ? (
              <Button
                text={t('performance.playClip')}
                onPress={() => (navigation as any).navigate('PerformancePreview', { clipId: post.payload.clipId })}
              />
            ) : (
              <Text preset="muted">{t('performance.noClipAttached')}</Text>
            )}
          </Box>
        ) : null}

        {post.type === 'duet' ? (
          <Box style={{ marginTop: 12, gap: 8 }}>
            <Text preset="muted">{t('duets.postDetailLine')}</Text>
            {post.payload?.duetId ? (
              <Button
                text={t('duets.openDuet')}
                onPress={() => (navigation as any).navigate('DuetSession', { duetId: post.payload.duetId })}
              />
            ) : (
              <Text preset="muted">{t('duets.noDuetAttached')}</Text>
            )}
          </Box>
        ) : null}

        <Box style={{ marginTop: 14, gap: 10 }}>
          <Text preset="muted">{t('post.react')}</Text>
          <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {REACTIONS.map((r, idx) => (
              <Button
                key={`${r}-${idx}`}
                text={`${r} ${reactionCounts[r] ?? 0}`}
                variant="soft"
                onPress={async () => {
                  const me = await ensureSelfPerson()
                  await setReaction({ postId: post.id, userId: me.id, reaction: r })
                  await refresh()
                }}
              />
            ))}
          </Box>

          <Box style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
            <Button text={t('post.share')} onPress={shareThis} />
            {meId && post.authorId !== meId ? (
              <Button
                text={following ? t('post.unfollow') : t('post.follow')}
                variant="soft"
                onPress={async () => {
                  const me = await ensureSelfPerson()
                  if (following) await unfollow(me.id, post.authorId)
                  else await follow(me.id, post.authorId)
                  setFollowing(!following)
                }}
              />
            ) : null}
            <Button
              text={t('post.hide')}
              variant="ghost"
              onPress={async () => {
                await hidePost(post.id)
                snackbar.show(t('post.hidden'))
                navigation.goBack()
              }}
            />
            <Button
              text={t('post.blockUser')}
              variant="ghost"
              onPress={() => {
                Alert.alert(t('post.blockTitle'), t('post.blockBody', { name: post.authorName }), [
                  { text: t('common.cancel'), style: 'cancel' },
                  {
                    text: t('post.blockConfirm'),
                    style: 'destructive',
                    onPress: async () => {
                      await setBlocked(post.authorId, true)
                      snackbar.show(t('post.blocked'))
                      navigation.goBack()
                    },
                  },
                ])
              }}
            />

            <Button
              text={t('post.report')}
              variant="ghost"
              onPress={async () => {
                const me = await ensureSelfPerson()
                await createReport({
                  reporterId: me.id,
                  reporterName: me.displayName,
                  entityKind: 'post',
                  entityId: post.id,
                  reason: 'abuse',
                  notes: null,
                })
                snackbar.show(t('post.reported'))
              }}
            />
          </Box>
        </Box>
      </Card>

      <Card>
        <Text preset="h2">{t('post.commentsTitle')}</Text>
        <Text preset="muted">{t('post.commentsSubtitle')}</Text>

        <Box style={{ marginTop: 10, gap: 10 }}>
          {comments.length ? (
            comments.map((c) => (
              <ListRow
                key={c.id}
                title={`${c.userName}`}
                subtitle={c.body}
                leftIcon="💬"
                right={
                  <Button
                    text={t('post.report')}
                    variant="ghost"
                    onPress={async () => {
                      const me = await ensureSelfPerson()
                      await createReport({
                        reporterId: me.id,
                        reporterName: me.displayName,
                        entityKind: 'comment',
                        entityId: c.id,
                        reason: 'abuse',
                        notes: null,
                      })
                      snackbar.show(t('post.reported'))
                    }}
                  />
                }
              />
            ))
          ) : (
            <Text preset="muted">{t('post.commentsEmpty')}</Text>
          )}
        </Box>

        <Box style={{ marginTop: 12, gap: 10 }}>
          <Input value={text} onChangeText={setText} label={t('post.addCommentLabel')} placeholder={t('post.addCommentPlaceholder')} />
          <Button
            text={t('post.addCommentButton')}
            disabled={!text.trim()}
            onPress={async () => {
              const v = validateComment(text)
              if (!v.ok) {
                snackbar.show(v.error ?? t('post.commentInvalid'))
                return
              }
              const me = await ensureSelfPerson()
              await addComment({ postId: post.id, userId: me.id, userName: me.displayName, body: text.trim() })
              setText('')
              await refresh()
            }}
          />
        </Box>
      </Card>

      <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  )
}
