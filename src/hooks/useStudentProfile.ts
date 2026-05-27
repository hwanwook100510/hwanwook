import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { useAuth } from '../contexts/useAuth'
import { db } from '../firebase'
import type { StudentProfile } from '../types'
import { normalizeEmail } from '../utils/permissions'
import { useLocalStorage } from './useLocalStorage'

export function useStudentProfile() {
  const { user } = useAuth()
  const email = user?.email
  const [profiles] = useLocalStorage<StudentProfile[]>('dimigo-student-profiles', [])
  const [remoteState, setRemoteState] = useState<{ email: string, profile: StudentProfile | null } | null>(null)
  const localProfile = profiles.find((profile) => normalizeEmail(profile.email) === normalizeEmail(email)) ?? null
  const remoteProfile = remoteState && remoteState.email === email ? remoteState.profile : null
  const remoteEmail = remoteState ? remoteState.email : null
  const loading = Boolean(db && email && remoteEmail !== email)

  useEffect(() => {
    if (!db || !email) {
      return
    }

    let ignore = false
    const currentEmail = email

    async function loadProfile() {
      const snapshot = await getDoc(doc(db!, 'studentProfiles', currentEmail))
      if (!ignore) {
        setRemoteState({ email: currentEmail, profile: snapshot.exists() ? snapshot.data() as StudentProfile : null })
      }
    }

    void loadProfile()

    return () => {
      ignore = true
    }
  }, [email])

  return {
    profile: remoteProfile ?? localProfile,
    loading,
    localProfiles: profiles,
  }
}
