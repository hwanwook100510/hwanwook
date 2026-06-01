import { adminDb, emailHash, FieldValue, normalizeEmail, sendJson } from '../_lib/firebaseAdmin'
import { adminAuth } from '../_lib/firebaseAdmin'
import type { ApiRequest, ApiResponse } from '../_lib/firebaseAdmin'

async function requireVerifiedSchoolUser(request: ApiRequest) {
  const header = request.headers.authorization
  const token = typeof header === 'string' && header.startsWith('Bearer ') ? header.slice('Bearer '.length) : ''

  if (!token) throw new Error('UNAUTHORIZED')

  const decoded = await adminAuth.verifyIdToken(token)
  const email = normalizeEmail(decoded.email)

  if (decoded.email_verified !== true || decoded.firebase.sign_in_provider !== 'google.com' || !email.endsWith('@dimigo.hs.kr')) {
    throw new Error('FORBIDDEN')
  }

  return { uid: decoded.uid, email }
}

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== 'POST') {
    sendJson(response, 405, { ok: false })
    return
  }

  try {
    const user = await requireVerifiedSchoolUser(request)
    const hash = emailHash(user.email)
    const [blockedSnapshot, suspendedSnapshot] = await Promise.all([
      adminDb.doc(`blockedEmailHashes/${hash}`).get(),
      adminDb.doc(`suspendedUsers/${user.uid}`).get(),
    ])
    const blocked = blockedSnapshot.exists && blockedSnapshot.get('enabled') === true
    const suspended = suspendedSnapshot.exists && suspendedSnapshot.get('enabled') === true

    if (blocked || suspended) {
      sendJson(response, 403, { ok: false, message: '이 계정은 현재 사용이 중지되어 있습니다.' })
      return
    }

    await adminDb.doc(`onboardingApprovals/${user.uid}`).set({
      enabled: true,
      emailHash: hash,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true })

    sendJson(response, 200, { ok: true })
  } catch {
    sendJson(response, 403, { ok: false, message: '계정 상태를 확인하지 못했습니다.' })
  }
}
