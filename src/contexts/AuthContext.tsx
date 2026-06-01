import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db, googleProvider, isFirebaseConfigured } from '../firebase'
import { ADMIN_EMAILS, isAdminEmail, normalizeEmail } from '../utils/permissions'
import { AuthContext } from './authState'
import type { AuthContextValue } from './authState'

const DIMIGO_DOMAIN = '@dimigo.hs.kr'
const ALLOWED_EMAILS = ADMIN_EMAILS
const DOMAIN_ERROR = '한국디지털미디어고등학교 계정만 로그인할 수 있습니다.'
const CONFIG_ERROR = '서비스 설정이 아직 완료되지 않았습니다. 관리자에게 문의해주세요.'
const ADMIN_ACCESS_CODE = 'hwanwook'
const ADMIN_CODE_SESSION_KEY = 'dimigo-admin-code-accepted'

function hasAcceptedAdminCode() {
  return typeof window !== 'undefined' && window.sessionStorage.getItem(ADMIN_CODE_SESSION_KEY) === 'true'
}

function isAllowedEmail(email: string | null) {
  const normalizedEmail = normalizeEmail(email)
  return Boolean(normalizedEmail?.endsWith(DIMIGO_DOMAIN) || ALLOWED_EMAILS.includes(normalizedEmail ?? ''))
}

async function isSuspendedEmail(email: string | null) {
  if (!db || !email || isAllowedEmail(email) === false) {
    return false
  }

  const snapshot = await getDoc(doc(db, 'suspendedUsers', email))

  return snapshot.exists()
}

async function loadAdminStatus(email: string | null, adminCodeAccepted = false) {
  if (!db || !email) {
    return adminCodeAccepted
  }

  if (adminCodeAccepted || isAdminEmail(email)) {
    return true
  }

  try {
    const snapshot = await getDoc(doc(db, 'adminUsers', normalizeEmail(email)))
    return snapshot.exists()
  } catch {
    return false
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [error, setError] = useState(isFirebaseConfigured ? '' : CONFIG_ERROR)
  const [adminCodeAccepted, setAdminCodeAccepted] = useState(hasAcceptedAdminCode)

  useEffect(() => {
    const firebaseAuth = auth

    if (!firebaseAuth) {
      return
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
      if (currentUser && !isAllowedEmail(currentUser.email)) {
        setUser(null)
        setIsAdmin(false)
        setError(DOMAIN_ERROR)
        await signOut(firebaseAuth)
        setLoading(false)
        return
      }

      if (currentUser && await isSuspendedEmail(currentUser.email)) {
        setUser(null)
        setIsAdmin(false)
        setError('')
        await signOut(firebaseAuth)
        setLoading(false)
        return
      }

      setUser(currentUser)
      setIsAdmin(await loadAdminStatus(currentUser?.email ?? null, adminCodeAccepted))
      setLoading(false)
    })

    return unsubscribe
  }, [adminCodeAccepted])

  const loginWithGoogle = useCallback(async () => {
    if (!auth || !googleProvider) {
      setError(CONFIG_ERROR)
      return
    }

    setError('')
    const result = await signInWithPopup(auth, googleProvider)

    if (!isAllowedEmail(result.user.email)) {
      setUser(null)
      setIsAdmin(false)
      setError(DOMAIN_ERROR)
      await signOut(auth)
      return
    }

    if (await isSuspendedEmail(result.user.email)) {
      setUser(null)
      setIsAdmin(false)
      setError('')
      await signOut(auth)
      return
    }

    setUser(result.user)
    setIsAdmin(await loadAdminStatus(result.user.email, adminCodeAccepted))
  }, [adminCodeAccepted])

  const logout = useCallback(async () => {
    setError('')
    window.sessionStorage.removeItem(ADMIN_CODE_SESSION_KEY)
    setAdminCodeAccepted(false)

    if (!auth) {
      setUser(null)
      setIsAdmin(false)
      return
    }

    await signOut(auth)
    setUser(null)
    setIsAdmin(false)
  }, [])

  const verifyAdminCode = useCallback((code: string) => {
    if (code.trim() !== ADMIN_ACCESS_CODE) {
      setError('보안코드가 올바르지 않습니다.')
      return false
    }

    window.sessionStorage.setItem(ADMIN_CODE_SESSION_KEY, 'true')
    setAdminCodeAccepted(true)
    setError('')
    setIsAdmin(Boolean(user))
    return true
  }, [user])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAdmin,
    loading,
    error,
    adminCodeAccepted,
    loginWithGoogle,
    logout,
    verifyAdminCode,
    clearError: () => setError(''),
  }), [user, isAdmin, loading, error, adminCodeAccepted, loginWithGoogle, logout, verifyAdminCode])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
