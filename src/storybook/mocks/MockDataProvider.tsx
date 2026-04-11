import React, { createContext, useContext } from 'react'
import type { SandboxDataSource } from '@/app/dev/sandbox/types'

type MockDataContextValue = {
  userName: string
  streakDays: number
  latestScore: number
  source: SandboxDataSource
}

const MockDataContext = createContext<MockDataContextValue>({
  userName: 'Singer',
  streakDays: 4,
  latestScore: 82,
  source: 'mock',
})

export function MockDataProvider({ children }: { children: React.ReactNode }) {
  return (
    <MockDataContext.Provider
      value={{
        userName: 'Promise',
        streakDays: 6,
        latestScore: 84,
        source: 'mock',
      }}
    >
      {children}
    </MockDataContext.Provider>
  )
}

export function useMockData() {
  return useContext(MockDataContext)
}
