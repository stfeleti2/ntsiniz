export const theme = {
  colors: {
    bg: "#0B0D12",
    card: "#141824",
    text: "#FFFFFF",
    muted: "#A6B0CF",
    accent: "#7C5CFF",
    accent2: "#FF3DCE",
    accent3: "#00E5FF",
    good: "#2EE59D",
    warn: "#FFC542",
    bad: "#FF5C5C",
    line: "#242A3D",
  },
  gradients: {
    primary: ["#7C5CFF", "#FF3DCE", "#FFC542"],
    hero: ["#0B0D12", "#2A1255", "#0B0D12"],
    surface: ["#141824", "#1A1F33"],
    glow: ["rgba(124, 92, 255, 0.35)", "rgba(255, 61, 206, 0.22)", "rgba(0, 229, 255, 0.16)"],
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    md: 14,
    lg: 20,
  },
} as const

export type AppTheme = typeof theme
