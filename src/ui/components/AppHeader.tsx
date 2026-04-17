import React from 'react'
import { View } from 'react-native'
import { Heading } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'
import { useTheme } from '@/theme/provider'

export function AppHeader({ title, subtitle }: { title: string; subtitle?: string }) {
	const { spacing } = useTheme()

	return (
		<View style={{ gap: spacing[1] }}>
			<Heading level={1}>{title}</Heading>
			{subtitle ? <Text preset="caption">{subtitle}</Text> : null}
		</View>
	)
}
