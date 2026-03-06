export type PerformanceClip = {
  id: string
  createdAt: number
  updatedAt: number
  userId: string
  displayName: string
  templateId: string
  title: string
  durationMs: number
  videoUri: string
  thumbnailUri: string | null
  score: number
  metrics: Record<string, any>
  hidden: boolean
}
