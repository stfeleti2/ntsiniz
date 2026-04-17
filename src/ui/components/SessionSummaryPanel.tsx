import React from 'react'
import { View } from 'react-native'
import { Card } from '@/ui/components/kit'
import { Heading } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'
import { StatusBanner } from '@/ui/components/StatusBanner'
import { useTheme } from '@/theme/provider'

export function SessionSummaryPanel({ score = 82 }: { score?: number }) {
	const { spacing } = useTheme()

	return (
		<Card tone="glow">
			<View style={{ gap: spacing[2] }}>
				<Heading level={2}>Session Summary</Heading>
				<Text preset="muted">Latest score: {score}</Text>
				<StatusBanner
					title={score >= 80 ? 'Great win' : 'Keep pushing'}
					body={score >= 80 ? 'You held pitch with strong consistency.' : 'Focus on steadier breath support on long notes.'}
					tone={score >= 80 ? 'success' : 'warning'}
				/>
			</View>
		</Card>
	)
}
