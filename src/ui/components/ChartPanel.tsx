import React from 'react'
import { View } from 'react-native'
import { Card } from '@/ui/components/kit'
import { Heading } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'
import { useTheme } from '@/theme/provider'

function normalize(points: number[]) {
	const max = Math.max(...points, 1)
	return points.map((point) => Math.max(0.08, point / max))
}

export function ChartPanel({ points = [64, 68, 71, 73, 76, 79, 82] }: { points?: number[] }) {
	const { colors, spacing, radius } = useTheme()
	const normalized = normalize(points)

	return (
		<Card>
			<View style={{ gap: spacing[2] }}>
				<Heading level={3}>Performance Trend</Heading>
				<View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing[1], minHeight: 92 }}>
					{normalized.map((value, index) => (
						<View
							key={`${index}-${value}`}
							style={{
								flex: 1,
								height: `${Math.round(value * 100)}%`,
								minHeight: 14,
								borderRadius: radius[1],
								backgroundColor: index === normalized.length - 1 ? colors.primary : colors.secondary,
								opacity: index === normalized.length - 1 ? 1 : 0.6,
							}}
						/>
					))}
				</View>
				<Text preset="caption">Last 7 attempts</Text>
			</View>
		</Card>
	)
}
