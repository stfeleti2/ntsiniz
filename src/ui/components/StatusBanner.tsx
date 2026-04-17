import React from 'react'
import { View } from 'react-native'
import { Heading } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'
import { useTheme } from '@/theme/provider'
import { withAlpha } from '@/theme/neumorphism/style'

export type StatusTone = 'info' | 'success' | 'warning' | 'danger'

export function StatusBanner({
	title,
	body,
	tone = 'info',
	testID,
}: {
	title: string
	body?: string
	tone?: StatusTone
	testID?: string
}) {
	const { colors, radius } = useTheme()
	const borderColor =
		tone === 'success' ? colors.success : tone === 'warning' ? colors.warning : tone === 'danger' ? colors.danger : colors.secondary
	const backgroundColor =
		tone === 'success'
			? withAlpha(colors.success, 0.16)
			: tone === 'warning'
				? withAlpha(colors.warning, 0.16)
				: tone === 'danger'
					? withAlpha(colors.danger, 0.16)
					: withAlpha(colors.secondary, 0.16)

	return (
		<View
			testID={testID}
			style={{
				borderWidth: 1,
				borderColor,
				borderRadius: radius[3],
				padding: 12,
				gap: 6,
				backgroundColor,
			}}
		>
			<Heading level={3}>{title}</Heading>
			{body ? <Text preset="muted">{body}</Text> : null}
		</View>
	)
}
