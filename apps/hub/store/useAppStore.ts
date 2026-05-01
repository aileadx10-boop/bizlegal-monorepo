import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  plan: 'free' | 'pro' | 'enterprise'
  scansUsed: number
  scanLimit: number
}

interface Session {
  accessToken: string | null
  refreshToken: string | null
  expiresAt: number | null
}

interface AppState {
  user: User | null
  session: Session | null
  isLoading: boolean
  scanHistory: ScanResult[]
  
  // Actions
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  addScan: (scan: ScanResult) => void
  clearSession: () => void
  incrementScansUsed: () => void
}

interface ScanResult {
  id: string
  createdAt: string
  riskScore: number
  confidence: number
  issuesCount: number
  jurisdiction: string
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: false,
      scanHistory: [],

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (isLoading) => set({ isLoading }),
      
      addScan: (scan) =>
        set((state) => ({
          scanHistory: [scan, ...state.scanHistory].slice(0, 50),
        })),
      
      clearSession: () =>
        set({ user: null, session: null, scanHistory: [] }),
      
      incrementScansUsed: () =>
        set((state) => ({
          user: state.user
            ? { ...state.user, scansUsed: state.user.scansUsed + 1 }
            : null,
        })),
    }),
    {
      name: 'bizlegal-storage',
      partialize: (state) => ({
        user: state.user,
        scanHistory: state.scanHistory.slice(0, 10),
      }),
    }
  )
)
