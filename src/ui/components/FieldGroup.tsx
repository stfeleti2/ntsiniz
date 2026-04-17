import React from 'react'
import { View } from 'react-native'
import { Heading } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'
import { useTheme } from '@/theme/provider'

export function FieldGroup({
	title,
	hint,
	children,
}: {
	title?: string
	hint?: string
	children?: React.ReactNode
}) {
	const { spacing } = useTheme()

	return (
		<View style={{ gap: spacing[2] }}>
			{title ? <Heading level={3}>{title}</Heading> : null}
			{hint ? <Text preset="caption">{hint}</Text> : null}
			<View style={{ gap: spacing[2] }}>{children}</View>
		</View>
	)
}
