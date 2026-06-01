import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { browserLocalPersistence, getRedirectResult, onAuthStateChanged, setPersistence, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db, googleProvider, isFirebaseConfigured } from '../firebase'
import { normalizeEmail } from '../utils/permissions'
import { AuthContext } from './authState'
import type { AuthContextValue } from './authState'

const DIMIGO_DOMAIN = '@dimigo.hs.kr'
const DOMAIN_ERROR = '한국디지털미디어고등학교 계정만 로그인할 수 있습니다.'
const CONFIG_ERROR = '서비스 설정이 아직 완료되지 않았습니다. 관리자에게 문의해주세요.'
const redirectStartedKey = 'dimigo-google-redirect-started'

function isAllowedEmail(email: string | null) {
  const normalizedEmail = normalizeEmail(email)
  return Boolean(normalizedEmail?.endsWith(DIMIGO_DOMAIN))
}

type AuthStatus = {
  isAdmin?: boolean
  isAllowedLogin?: boolean
}

function firebaseErrorCode(error: unknown) {
  return typeof error === 'object' && error && 'code' in error ? String(error.code) : ''
}

function googleLoginErrorMessage(error: unknown) {
  const code = firebaseErrorCode(error)

  if (code.includes('unauthorized-domain')) {
    return '현재 도메인이 Firebase 승인 도메인에 없습니다. Authentication > Settings > Authorized domains에 hwanwook.vercel.app을 추가해주세요.'
  }

  if (code.includes('operation-not-allowed')) {
    return 'Firebase Authentication에서 Google 로그인이 꺼져 있습니다. Sign-in method에서 Google을 켜주세요.'
  }

  if (code.includes('popup-blocked') || code.includes('popup-closed') || code.includes('cancelled-popup-request') || code.includes('internal-error')) {
    return ''
  }

  return `Google 로그인 중 오류가 발생했습니다.${code ? ` (${code})` : ''}`
}

function shouldTryRedirectLogin(error: unknown) {
  const code = firebaseErrorCode(error)

  return code.includes('popup-blocked')
    || code.includes('popup-closed')
    || code.includes('cancelled-popup-request')
    || code.includes('internal-error')
}

async function isSuspendedUser(user: User | null) {
  if (!db || !user?.uid || isAllowedEmail(user.email) === false) {
    return false
  }

  const snapshot = await getDoc(doc(db, 'suspendedUsers', user.uid))

  return snapshot.exists() && snapshot.data().enabled === true
}

async function loadAuthStatus(user: User | null): Promise<AuthStatus> {
  if (!user) {
    return {}
  }

  try {
    const token = await user.getIdToken()
    const response = await fetch('/api/auth/status', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    const data = await response.json() as AuthStatus
    return response.ok ? data : {}
  } catch {
    return {}
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [error, setError] = useState(isFirebaseConfigured ? '' : CONFIG_ERROR)

  useEffect(() => {
    const firebaseAuth = auth

    if (!firebaseAuth) {
      return
    }

    const activeAuth = firebaseAuth

    let mounted = true

    async function applyUser(currentUser: User | null) {
      const currentStatus = await loadAuthStatus(currentUser)
      const currentIsAdmin = currentStatus.isAdmin === true

      if (currentUser && currentStatus.isAllowedLogin !== true && !isAllowedEmail(currentUser.email)) {
        if (!mounted) return
        setUser(null)
        setIsAdmin(false)
        setError(`${DOMAIN_ERROR} 선택한 계정: ${currentUser.email ?? '확인 불가'}`)
        await signOut(activeAuth)
        if (mounted) setLoading(false)
        return
      }

      if (currentUser && await isSuspendedUser(currentUser)) {
        if (!mounted) return
        setUser(null)
        setIsAdmin(false)
        setError('')
        await signOut(activeAuth)
        if (mounted) setLoading(false)
        return
      }

      if (!mounted) return
      setUser(currentUser)
      setIsAdmin(currentIsAdmin)
      setLoading(false)
    }

    if (window.sessionStorage.getItem(redirectStartedKey) === 'true') {
      void getRedirectResult(activeAuth)
        .then((result) => {
          window.sessionStorage.removeItem(redirectStartedKey)
          if (result?.user) void applyUser(result.user)
        })
        .catch((redirectError) => {
          window.sessionStorage.removeItem(redirectStartedKey)
          const code = firebaseErrorCode(redirectError)
          if (code.includes('internal-error')) {
            return
          }

          if (mounted && !activeAuth.currentUser) setError(`Google 로그인 결과를 처리하지 못했습니다.${code ? ` (${code})` : ''}`)
        })
    }

    const unsubscribe = onAuthStateChanged(activeAuth, async (currentUser) => {
      await applyUser(currentUser)
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  const loginWithGoogle = useCallback(async () => {
    if (!auth || !googleProvider) {
      setError(CONFIG_ERROR)
      return
    }

    setError('')
    try {
      await setPersistence(auth, browserLocalPersistence)
      const result = await signInWithPopup(auth, googleProvider)

      const resultStatus = await loadAuthStatus(result.user)
      const resultIsAdmin = resultStatus.isAdmin === true

      if (resultStatus.isAllowedLogin !== true && !isAllowedEmail(result.user.email)) {
        setUser(null)
        setIsAdmin(false)
        setError(`${DOMAIN_ERROR} 선택한 계정: ${result.user.email ?? '확인 불가'}`)
        await signOut(auth)
        return
      }

      if (await isSuspendedUser(result.user)) {
        setUser(null)
        setIsAdmin(false)
        setError('정지된 계정입니다. 관리자에게 문의해주세요.')
        await signOut(auth)
        return
      }

      setUser(result.user)
      setIsAdmin(resultIsAdmin)
    } catch (error) {
      const fallbackMessage = googleLoginErrorMessage(error)

      if (fallbackMessage || !shouldTryRedirectLogin(error)) {
        setError(fallbackMessage)
        return
      }

      try {
        await setPersistence(auth, browserLocalPersistence)
        window.sessionStorage.setItem(redirectStartedKey, 'true')
        await signInWithRedirect(auth, googleProvider)
      } catch (redirectError) {
        window.sessionStorage.removeItem(redirectStartedKey)
        setError(googleLoginErrorMessage(redirectError) || 'Google 로그인 페이지로 이동하지 못했습니다. Firebase 승인 도메인과 브라우저 설정을 확인해주세요.')
      }
    }
  }, [])

  const logout = useCallback(async () => {
    setError('')

    if (!auth) {
      setUser(null)
      setIsAdmin(false)
      return
    }

    await signOut(auth)
    setUser(null)
    setIsAdmin(false)
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAdmin,
    loading,
    error,
    loginWithGoogle,
    logout,
    clearError: () => setError(''),
  }), [user, isAdmin, loading, error, loginWithGoogle, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
