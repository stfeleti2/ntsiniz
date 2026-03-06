export type Person = {
  id: string
  kind: 'self' | 'friend'
  createdAt: number
  updatedAt: number
  displayName: string
  avatarSeed?: string | null
  bio?: string | null
  isBlocked: boolean
}

export type ChallengeSubmission = {
  id: string
  createdAt: number
  updatedAt: number
  period: 'daily' | 'weekly'
  periodKey: string
  challengeId: string
  userId: string
  displayName: string
  score: number
  details: any
  source: 'self' | 'import'
  expiresAt?: number | null
  hidden?: boolean
}

export type Post = {
  id: string
  createdAt: number
  updatedAt: number
  authorId: string
  authorName: string
  type: 'progress' | 'challenge' | 'performance'
  title: string
  body: string
  payload: any
  source: 'self' | 'import'
  expiresAt?: number | null
  hidden?: boolean
}

export type PostReaction = {
  postId: string
  userId: string
  reaction: string
  createdAt: number
}

export type PostComment = {
  id: string
  postId: string
  userId: string
  userName: string
  createdAt: number
  body: string
  hidden?: boolean
}
