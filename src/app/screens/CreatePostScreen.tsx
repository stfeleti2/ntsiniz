import React, { useEffect, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Share } from 'react-native'

import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/kit'
import { Input } from '@/ui/components/kit/Input'
import { Box } from '@/ui'
import { useSnackbar } from '@/ui/components/kit/Snackbar'
import { t } from '@/app/i18n'

import { ensureSelfPerson } from '@/core/social/peopleRepo'
import { createPost } from '@/core/social/postsRepo'
import { createMyPostCode } from '@/core/social/shareCode'
import { listSessionAggregates } from '@/core/storage/sessionsRepo'

type Props = NativeStackScreenProps<RootStackParamList, 'CreatePost'>

export function CreatePostScreen({ navigation }: Props) {
  const snackbar = useSnackbar()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [hint, setHint] = useState<string | null>(null)
  const [lastScore, setLastScore] = useState<number | null>(null)

  useEffect(() => {
    ;(async () => {
      const aggs = await listSessionAggregates(10)
      const last = aggs?.length ? aggs[aggs.length - 1] : null
      const score = last ? Math.round(last.avgScore) : null
      setLastScore(score)
      if (score != null) {
        setHint(t('createPost.suggested', { score }))
        setTitle(t('createPost.defaultTitle', { score }))
        setBody(t('createPost.defaultBody'))
      }
    })().catch(() => {})
  }, [])

  const submit = async () => {
    const me = await ensureSelfPerson()
    const payload = { lastScore }
    const post = await createPost({
      authorId: me.id,
      authorName: me.displayName,
      type: 'progress',
      title: title.trim() || t('createPost.fallbackTitle'),
      body: body.trim() || '',
      payload,
      source: 'self',
      expiresAt: Date.now() + 30 * 86400000,
    })

    // Share as importable code (offline-friendly)
    const code = await createMyPostCode({
      type: post.type,
      title: post.title,
      body: post.body,
      payload: post.payload,
      expiresAt: post.expiresAt ?? null,
    } as any)
    const link = `ntsiniz://import?code=${code}`
    const headline = post.title
    const scoreLine = lastScore != null ? `${t('share.scoreLabel')}: ${lastScore}` : ''
    await Share.share({
      message: `${headline}\n${scoreLine}\n\n${t('share.postIntro')}\n${link}\n\n${t('share.codeFallback')}\n${code}`.trim(),
    })

    snackbar.show(t('createPost.posted'))
    navigation.goBack()
  }

  return (
    <Screen scroll background="gradient">
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{t('createPost.title')}</Text>
        <Text preset="muted">{t('createPost.subtitle')}</Text>
      </Box>

      <Card tone="glow">
        {hint ? <Text preset="muted">{hint}</Text> : null}
        <Text preset="muted" style={{ marginTop: 6 }}>
          {t('createPost.visibility')}
        </Text>
        <Input value={title} onChangeText={setTitle} label={t('createPost.titleLabel')} placeholder={t('createPost.titlePlaceholder')} />
        <Input value={body} onChangeText={setBody} label={t('createPost.bodyLabel')} placeholder={t('createPost.bodyPlaceholder')} />
        <Box style={{ marginTop: 12, gap: 10 }}>
          <Button text={t('createPost.postAndShare')} onPress={submit} />
          <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
        </Box>
      </Card>
    </Screen>
  )
}
