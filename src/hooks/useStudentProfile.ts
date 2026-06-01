import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { useAuth } from '../contexts/useAuth'
import { db } from '../firebase'
import type { StudentProfile } from '../types'

const profileCache = new Map<string, StudentProfile | null>()
const profileRequests = new Map<string, Promise<StudentProfile | null>>()

export function useStudentProfile() {
  const { user } = useAuth()
  const email = user?.email
  const uid = user?.uid
  const cachedProfile = email && profileCache.has(email) ? profileCache.get(email) ?? null : null
  const [remoteState, setRemoteState] = useState<{ email: string, profile: StudentProfile | null } | null>(
    email && profileCache.has(email) ? { email, profile: cachedProfile } : null,
  )
  const remoteProfile = remoteState && remoteState.email === email ? remoteState.profile : null
  const remoteEmail = remoteState ? remoteState.email : null
  const loading = Boolean(db && email && remoteEmail !== email)

  useEffect(() => {
    if (!db || !email || !uid) {
      return
    }

    let ignore = false
    const currentEmail = email
    const currentUid = uid

    async function loadProfile() {
      if (profileCache.has(currentEmail)) {
        setRemoteState({ email: currentEmail, profile: profileCache.get(currentEmail) ?? null })
        return
      }

      let request = profileRequests.get(currentEmail)

      if (!request) {
        request = getDoc(doc(db!, 'studentProfiles', currentUid)).then((snapshot) => {
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
  }, [email, uid])

  return {
    profile: remoteProfile,
    loading,
  }
}
