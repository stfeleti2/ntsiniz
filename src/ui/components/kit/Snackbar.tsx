import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { Animated } from 'react-native'
import { Text, Pressable } from '../../primitives'
import { useTheme } from '../../theme'

type SnackbarCtx = {
  show: (message: string) => void
}

const Ctx = createContext<SnackbarCtx | null>(null)

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const { colors, radius, spacing, zIndex } = useTheme()
  const [message, setMessage] = useState<string | null>(null)
  const opacity = useRef(new Animated.Value(0)).current

  const show = useCallback(
    (msg: string) => {
      setMessage(msg)
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start()
      setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(({ finished }) => {
          if (finished) setMessage(null)
        })
      }, 1800)
    },
    [opacity],
  )

  const value = useMemo(() => ({ show }), [show])

  return (
    <Ctx.Provider value={value}>
      {children}
      {message ? (
        <Animated.View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            left: spacing[4],
            right: spacing[4],
            bottom: spacing[6],
            opacity,
            zIndex: zIndex.toast,
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={message}
            onPress={() => setMessage(null)}
            style={{
              backgroundColor: colors.surface2,
              borderRadius: radius[3],
              padding: spacing[4],
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text>{message}</Text>
          </Pressable>
        </Animated.View>
      ) : null}
    </Ctx.Provider>
  )
}

export function useSnackbar() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useSnackbar must be used within SnackbarProvider')
  return ctx
}
