import { createContext } from 'react'
import type { User } from 'firebase/auth'

export type AuthContextValue = {
  user: User | null
  isAdmin: boolean
  loading: boolean
  error: string
  adminCodeAccepted: boolean
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  verifyAdminCode: (code: string) => Promise<boolean>
  clearError: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
