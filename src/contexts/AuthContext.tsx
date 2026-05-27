import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider, isFirebaseConfigured } from '../firebase'
import type { StudentProfile } from '../types'
import { ADMIN_EMAILS, normalizeEmail } from '../utils/permissions'
import { AuthContext } from './authState'
import type { AuthContextValue } from './authState'

const DIMIGO_DOMAIN = '@dimigo.hs.kr'
const ALLOWED_EMAILS = ADMIN_EMAILS
const DOMAIN_ERROR = '한국디지털미디어고등학교 계정만 로그인할 수 있습니다.'
const CONFIG_ERROR = 'Firebase 설정이 아직 완료되지 않았습니다. .env 파일을 먼저 설정해주세요.'

function isAllowedEmail(email: string | null) {
  const normalizedEmail = normalizeEmail(email)
  return Boolean(normalizedEmail?.endsWith(DIMIGO_DOMAIN) || ALLOWED_EMAILS.includes(normalizedEmail ?? ''))
}

async function syncLocalProfileToFirestore(currentUser: User) {
  if (!db || !currentUser.email) {
    return
  }

  const storedProfiles = localStorage.getItem('dimigo-student-profiles')

  if (!storedProfiles) {
    return
  }

  try {
    const profiles = JSON.parse(storedProfiles) as StudentProfile[]
    const profile = profiles.find((item) => normalizeEmail(item.email) === normalizeEmail(currentUser.email))

    if (!profile) {
      return
    }

    await setDoc(doc(db, 'studentProfiles', currentUser.email), profile, { merge: true })
  } catch (syncError) {
    console.error('Firestore 회원정보 동기화에 실패했습니다.', syncError)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [error, setError] = useState(isFirebaseConfigured ? '' : CONFIG_ERROR)

  useEffect(() => {
    const firebaseAuth = auth

    if (!firebaseAuth) {
      return
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
      if (currentUser && !isAllowedEmail(currentUser.email)) {
        setUser(null)
        setError(DOMAIN_ERROR)
        await signOut(firebaseAuth)
        setLoading(false)
        return
      }

      if (currentUser) {
        void syncLocalProfileToFirestore(currentUser)
      }
      setUser(currentUser)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    if (!user) {
      return
    }

    const syncProfile = () => {
      void syncLocalProfileToFirestore(user)
    }

    syncProfile()
    window.addEventListener('focus', syncProfile)

    return () => {
      window.removeEventListener('focus', syncProfile)
    }
  }, [user])

  const loginWithGoogle = async () => {
    if (!auth || !googleProvider) {
      setError(CONFIG_ERROR)
      return
    }

    setError('')
    const result = await signInWithPopup(auth, googleProvider)

    if (!isAllowedEmail(result.user.email)) {
      setUser(null)
      setError(DOMAIN_ERROR)
      await signOut(auth)
      return
    }

    setUser(result.user)
    void syncLocalProfileToFirestore(result.user)
  }

  const logout = async () => {
    setError('')

    if (!auth) {
      setUser(null)
      return
    }

    await signOut(auth)
    setUser(null)
  }

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    error,
    loginWithGoogle,
    logout,
    clearError: () => setError(''),
  }), [user, loading, error])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
