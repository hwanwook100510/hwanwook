import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { useAuth } from '../contexts/useAuth'
import { db } from '../firebase'
import type { StudentProfile } from '../types'
import { normalizeEmail } from '../utils/permissions'
import { useLocalStorage } from './useLocalStorage'

const profileCache = new Map<string, StudentProfile | null>()
const profileRequests = new Map<string, Promise<StudentProfile | null>>()

export function useStudentProfile() {
  const { user } = useAuth()
  const email = user?.email
  const [profiles] = useLocalStorage<StudentProfile[]>('dimigo-student-profiles', [])
  const normalizedEmail = normalizeEmail(email)
  const cachedProfile = email && profileCache.has(email) ? profileCache.get(email) ?? null : null
  const [remoteState, setRemoteState] = useState<{ email: string, profile: StudentProfile | null } | null>(
    email && profileCache.has(email) ? { email, profile: cachedProfile } : null,
  )
  const localProfile = profiles.find((profile) => normalizeEmail(profile.email) === normalizedEmail) ?? null
  const remoteProfile = remoteState && remoteState.email === email ? remoteState.profile : null
  const remoteEmail = remoteState ? remoteState.email : null
  const loading = Boolean(db && email && !localProfile && remoteEmail !== email)

  useEffect(() => {
    if (!db || !email) {
      return
    }

    let ignore = false
    const currentEmail = email

    async function loadProfile() {
      if (profileCache.has(currentEmail)) {
        setRemoteState({ email: currentEmail, profile: profileCache.get(currentEmail) ?? null })
        return
      }

      let request = profileRequests.get(currentEmail)

      if (!request) {
        request = getDoc(doc(db!, 'studentProfiles', currentEmail)).then((snapshot) => {
          const profile = snapshot.exists() ? snapshot.data() as StudentProfile : null
          profileCache.set(currentEmail, profile)
          profileRequests.delete(currentEmail)
          return profile
        })
        profileRequests.set(currentEmail, request)
      }

      const profile = await request

      if (!ignore) {
        setRemoteState({ email: currentEmail, profile })
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
