import React from 'react'
import { View, Text } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { getShareFooter } from '@/core/share/shareCopy'
import { t } from '@/core/i18n'

export type ShareCardProps = {
  title: string
  subtitle?: string
  scoreLabel?: string
  scoreValue?: string
  badge?: string
  footer?: string
  children?: React.ReactNode
}

/**
 * Render-only card intended to be captured via react-native-view-shot.
 * Keep it deterministic (no animations) so captures are clean.
 */
export const ShareCard = React.forwardRef<View, ShareCardProps>(function ShareCard(props, ref) {
  const footer = props.footer ?? getShareFooter()
  return (
    <View ref={ref} style={{ width: 1080, height: 1080, padding: 56, backgroundColor: '#0B0B10' }}>
      <LinearGradient
        colors={['#0B0B10', '#0E1830', '#0B0B10']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <View style={{ flex: 1, borderRadius: 48, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
        <LinearGradient colors={['rgba(55, 227, 255, 0.12)', 'rgba(168, 85, 247, 0.10)', 'rgba(255,255,255,0.02)']} style={{ flex: 1, padding: 56 }}>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '700', letterSpacing: 2 }}>
            {t('brand.name')}
          </Text>

          <View style={{ marginTop: 22 }}>
            <Text style={{ color: 'white', fontSize: 54, fontWeight: '900', lineHeight: 58 }} numberOfLines={3}>
              {props.title}
            </Text>
            {!!props.subtitle && (
              <Text style={{ color: 'rgba(255,255,255,0.72)', fontSize: 22, marginTop: 18 }} numberOfLines={3}>
                {props.subtitle}
              </Text>
            )}
          </View>

          <View style={{ flex: 1 }} />
          {props.children}
          {props.children ? <View style={{ height: 24 }} /> : null}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View>
              {!!props.badge && (
                <View style={{ backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 999, paddingVertical: 10, paddingHorizontal: 18, alignSelf: 'flex-start' }}>
                  <Text style={{ color: 'white', fontWeight: '900', fontSize: 18 }}>{props.badge}</Text>
                </View>
              )}
              {!!footer && (
                <Text style={{ color: 'rgba(255,255,255,0.55)', marginTop: 14, fontSize: 16 }}>
                  {footer}
                </Text>
              )}
            </View>

            {!!props.scoreValue && (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: 'rgba(255,255,255,0.60)', fontSize: 16, fontWeight: '700' }}>{props.scoreLabel ?? t('share.scoreLabel')}</Text>
                <Text style={{ color: 'white', fontSize: 72, fontWeight: '900', marginTop: 6 }}>{props.scoreValue}</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </View>
    </View>
  )
})
