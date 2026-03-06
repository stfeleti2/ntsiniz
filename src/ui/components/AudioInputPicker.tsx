import React, { useEffect, useState } from 'react'
import { Modal, Pressable, ScrollView, View } from 'react-native'
import { Text } from './Typography'
import { Button } from './Button'
import { listInputs, setPreferredInput, type RouteInfo } from '@/core/audio/routeManager'
import { t } from '@/core/i18n'

export function AudioInputPicker({
  visible,
  onClose,
  onSelected,
  currentUid,
}: {
  visible: boolean
  onClose: () => void
  onSelected: (uid: string | null) => void
  currentUid?: string | null
}) {
  const [inputs, setInputs] = useState<RouteInfo[]>([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!visible) return
    listInputs().then(setInputs).catch(() => setInputs([]))
  }, [visible])

  async function choose(uid: string | null) {
    setBusy(true)
    try {
      await setPreferredInput(uid)
      onSelected(uid)
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={onClose} />
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, borderTopLeftRadius: 18, borderTopRightRadius: 18, backgroundColor: '#0b0d16', padding: 16, maxHeight: '70%' }}>
        <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 8 }}>
          {t('audioInputPicker.title', 'Select microphone')}
        </Text>
        <Text style={{ fontSize: 12, opacity: 0.75, marginBottom: 12 }}>
          {t(
            'audioInputPicker.subtitle',
            'Wired or built-in mics usually sound best. Bluetooth mics can be lower quality and add latency.',
          )}
        </Text>

        <ScrollView>
          <Button text={t('audioInputPicker.systemDefault', 'System default')} onPress={() => choose(null)} disabled={busy} />
          <View style={{ height: 10 }} />
          {inputs.map((i, idx) => {
            const selected = currentUid && i.inputUid === currentUid
            const key = i.inputUid ?? (i.inputName ? `name:${i.inputName}` : `idx:${idx}`)
            return (
              <Pressable key={key} onPress={() => choose(i.inputUid ?? null)} style={{
                padding: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: selected ? 'rgba(120,180,255,0.8)' : 'rgba(255,255,255,0.12)',
                backgroundColor: selected ? 'rgba(120,180,255,0.12)' : 'rgba(255,255,255,0.04)',
                marginBottom: 8,
              }}>
                <Text style={{ fontSize: 14, fontWeight: '600' }}>{i.inputName || t('audioInputPicker.input', 'Input')}</Text>
                <Text style={{ fontSize: 12, opacity: 0.75 }}>
                  {i.routeType}
                  {i.isBluetoothInput ? ` ${t('audioInputPicker.bluetoothTag', '(Bluetooth)')}` : ''}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>

        <View style={{ height: 10 }} />
        <Button text={t('common.close', 'Close')} variant="soft" onPress={onClose} disabled={busy} />
      </View>
    </Modal>
  )
}
