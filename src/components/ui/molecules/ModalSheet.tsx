import React from 'react'
import { Modal, Pressable, StyleSheet } from 'react-native'
import { useTheme } from '@/theme/provider'

export function ModalSheet({
  visible,
  onClose,
  children,
}: {
  visible: boolean
  onClose: () => void
  children?: React.ReactNode
}) {
  const { colors, radius, spacing } = useTheme()

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          onPress={() => {}}
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surfaceRaised,
              borderTopLeftRadius: radius[4],
              borderTopRightRadius: radius[4],
              borderColor: colors.border,
              padding: spacing[4],
            },
          ]}
        >
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    minHeight: 180,
    borderWidth: 1,
  },
})
