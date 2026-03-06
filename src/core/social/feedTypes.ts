import type { Post } from './types'

export type FeedPostWithStats = Post & {
  stats: {
    reactions: number
    comments: number
    /** Used by the “New creators”/diversity heuristics in the offline feed engine. */
    authorPostCount?: number
  }
}

export type DiscoverFilter = 'forYou' | 'trending' | 'newCreators'
