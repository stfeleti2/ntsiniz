import type { MotionPreset, ThemeMode } from "@/theme/provider/theme"

export type SandboxDataSource = "mock" | "real-nav"

export type SandboxScenario =
  | "component-states"
  | "onboarding-flow"
  | "signin-flow"
  | "singing-flow"

export type FlowScenarioId = "onboarding" | "signin" | "singing-start"

export type ViewportPreset = "phone-sm" | "phone-lg" | "tablet"

export type FlowStep = {
  id: string
  title: string
  summary: string
  route?: string
  params?: Record<string, unknown> | undefined
}

export type FlowScenario = {
  id: FlowScenarioId
  title: string
  description: string
  startRoute: string
  startParams?: Record<string, unknown> | undefined
  steps: FlowStep[]
}

export type SandboxControls = {
  dataSource: SandboxDataSource
  scenario: FlowScenarioId
  themeMode: ThemeMode
  motionPreset: MotionPreset
  reducedMotion: boolean
  viewport: ViewportPreset
}
