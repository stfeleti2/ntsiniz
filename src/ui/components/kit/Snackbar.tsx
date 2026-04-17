import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { Animated } from 'react-native'
import { Text, Pressable } from '../../primitives'
import { useTheme } from '../../theme'

type SnackbarCtx = {
  show: (message: string) => void
}

const Ctx = createContext<SnackbarCtx | null>(null)

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const { spacing, zIndex, radius, colors } = useTheme()
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
            {/* SurfacePanel cannot be inside Animated.View without extra wrapper —
              use raw token-driven styles here so the Animated opacity works */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={message}
            onPress={() => setMessage(null)}
            style={{
              backgroundColor: colors.surfaceRaised,
              borderRadius: radius[3],
              padding: spacing[4],
              borderWidth: 1,
              borderColor: colors.borderStrong,
              shadowColor: colors.shadowDark,
              shadowOffset: { width: 4, height: 4 },
              shadowOpacity: 0.32,
              shadowRadius: 12,
              elevation: 5,
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
