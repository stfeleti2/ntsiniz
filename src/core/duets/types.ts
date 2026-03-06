export type DuetRole = 'inviter' | 'responder'
export type DuetStatus = 'invited' | 'recorded' | 'mixed'

export type Duet = {
  id: string
  createdAt: number
  updatedAt: number
  inviteId: string
  role: DuetRole
  inviterId: string
  inviterName: string
  title: string
  sampleRate: number
  durationMs: number
  partAUri: string
  partBUri?: string | null
  mixUri?: string | null
  status: DuetStatus
  source: 'self' | 'import'
  expiresAt?: number | null
  hidden: boolean
}

export type DuetInviteManifestV1 = {
  v: 1
  kind: 'duetInvite'
  inviteId: string
  createdAt: number
  expiresAt?: number
  title: string
  inviter: { id: string; displayName: string; avatarSeed?: string | null }
  sampleRate: number
  durationMs: number
  files: {
    partA: string
  }
}
