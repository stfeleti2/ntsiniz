import React from 'react'
import { View } from 'react-native'
import { Card } from '@/ui/components/kit'
import { Heading, PrimaryButton, SecondaryButton } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'
import { useTheme } from '@/theme/provider'

export function DrillControlPanel({
	title = 'Drill Controls',
	status = 'Ready to sing',
	onStart,
	onPause,
}: {
	title?: string
	status?: string
	onStart?: () => void
	onPause?: () => void
}) {
	const { spacing } = useTheme()

	return (
		<Card tone="elevated">
			<View style={{ gap: spacing[2] }}>
				<Heading level={3}>{title}</Heading>
				<Text preset="muted">{status}</Text>
				<View style={{ flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' }}>
					<PrimaryButton label="Start" onPress={onStart} />
					<SecondaryButton label="Pause" onPress={onPause} />
				</View>
			</View>
		</Card>
	)
}
