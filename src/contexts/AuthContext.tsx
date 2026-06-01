import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { browserLocalPersistence, getRedirectResult, onAuthStateChanged, setPersistence, signInAnonymously, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
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
const redirectStartedKey = 'dimigo-google-redirect-started'

function hasAcceptedAdminCode() {
  return typeof window !== 'undefined' && window.sessionStorage.getItem(ADMIN_CODE_SESSION_KEY) === 'true'
}

function isAllowedEmail(email: string | null) {
  const normalizedEmail = normalizeEmail(email)
  return Boolean(normalizedEmail?.endsWith(DIMIGO_DOMAIN) || ALLOWED_EMAILS.includes(normalizedEmail ?? ''))
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

  if (code.includes('internal-error')) {
    const origin = typeof window !== 'undefined' ? window.location.origin : '현재 도메인 확인 불가'
    return `Vercel 배포 환경의 Firebase 설정을 확인해주세요. 현재 도메인: ${origin}. Firebase Authorized domains에 이 도메인을 추가하고, Vercel 환경변수 VITE_FIREBASE_AUTH_DOMAIN/API_KEY/PROJECT_ID가 로컬 .env와 같은지 확인해야 합니다. (${code})`
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

async function isSuspendedEmail(email: string | null) {
  if (!db || !email || isAllowedEmail(email) === false) {
    return false
  }

  const snapshot = await getDoc(doc(db, 'suspendedUsers', email))

  return snapshot.exists()
}

async function hasAdminCodeSession(uid: string | null) {
  if (!db || !uid) {
    return false
  }

  try {
    const snapshot = await getDoc(doc(db, 'adminAccessSessions', uid))
    return snapshot.exists()
  } catch {
    return false
  }
}

async function loadAdminStatus(user: User | null, adminCodeAccepted = false) {
  const email = user?.email ?? null

  if (adminCodeAccepted && await hasAdminCodeSession(user?.uid ?? null)) {
    return true
  }

  if (!db || !email) {
    return adminCodeAccepted
  }

  if (isAdminEmail(email)) {
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

    const activeAuth = firebaseAuth

    let mounted = true

    async function applyUser(currentUser: User | null) {
      if (currentUser && !currentUser.isAnonymous && !adminCodeAccepted && !isAllowedEmail(currentUser.email)) {
        if (!mounted) return
        setUser(null)
        setIsAdmin(false)
        setError(`${DOMAIN_ERROR} 선택한 계정: ${currentUser.email ?? '확인 불가'}`)
        await signOut(activeAuth)
        if (mounted) setLoading(false)
        return
      }

      if (currentUser && !currentUser.isAnonymous && await isSuspendedEmail(currentUser.email)) {
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
      setIsAdmin(await loadAdminStatus(currentUser, adminCodeAccepted))
      setLoading(false)
    }

    void getRedirectResult(activeAuth)
      .then((result) => {
        window.sessionStorage.removeItem(redirectStartedKey)
        if (result?.user) void applyUser(result.user)
      })
      .catch((redirectError) => {
        window.sessionStorage.removeItem(redirectStartedKey)
        const code = typeof redirectError === 'object' && redirectError && 'code' in redirectError ? ` (${String(redirectError.code)})` : ''
        if (mounted) setError(`Google 로그인 결과를 처리하지 못했습니다.${code}`)
      })

    const unsubscribe = onAuthStateChanged(activeAuth, async (currentUser) => {
      await applyUser(currentUser)
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [adminCodeAccepted])

  const loginWithGoogle = useCallback(async () => {
    if (!auth || !googleProvider) {
      setError(CONFIG_ERROR)
      return
    }

    setError('')
    try {
      await setPersistence(auth, browserLocalPersistence)
      const result = await signInWithPopup(auth, googleProvider)

      if (!adminCodeAccepted && !isAllowedEmail(result.user.email)) {
        setUser(null)
        setIsAdmin(false)
        setError(`${DOMAIN_ERROR} 선택한 계정: ${result.user.email ?? '확인 불가'}`)
        await signOut(auth)
        return
      }

      if (await isSuspendedEmail(result.user.email)) {
        setUser(null)
        setIsAdmin(false)
        setError('정지된 계정입니다. 관리자에게 문의해주세요.')
        await signOut(auth)
        return
      }

      setUser(result.user)
      setIsAdmin(await loadAdminStatus(result.user, adminCodeAccepted))
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

  const verifyAdminCode = useCallback(async (code: string) => {
    if (code.trim() !== ADMIN_ACCESS_CODE) {
      setError('보안코드가 올바르지 않습니다.')
      return false
    }

    if (!auth || !db) {
      setError(CONFIG_ERROR)
      return false
    }

    const currentUser = auth.currentUser ?? (await signInAnonymously(auth)).user

    await setDoc(doc(db, 'adminAccessSessions', currentUser.uid), {
      enabled: true,
      accessCode: ADMIN_ACCESS_CODE,
      createdAt: serverTimestamp(),
    })

    const sessionSnapshot = await getDoc(doc(db, 'adminAccessSessions', currentUser.uid))

    if (!sessionSnapshot.exists()) {
      setError('관리자 세션을 확인하지 못했습니다. Firestore Rules 적용 상태를 확인해주세요.')
      return false
    }

    window.sessionStorage.setItem(ADMIN_CODE_SESSION_KEY, 'true')
    setAdminCodeAccepted(true)
    setError('')
    setUser(currentUser)
    setIsAdmin(true)
    return true
  }, [])

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
