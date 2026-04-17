import React from 'react'
import { Modal, Pressable, StyleSheet } from 'react-native'
import { Card } from '@/ui/components/kit'
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
	const { spacing } = useTheme()

	return (
		<Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
			<Pressable style={styles.backdrop} onPress={onClose}>
				<Pressable onPress={() => {}}>
					<Card tone="elevated" style={{ minHeight: 180, padding: spacing[4], borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
						{children}
					</Card>
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
})
