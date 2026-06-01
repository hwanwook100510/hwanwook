import { adminAuth, adminDb, normalizeEmail, sendJson } from '../_lib/firebaseAdmin'
import type { ApiRequest, ApiResponse } from '../_lib/firebaseAdmin'

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== 'POST') {
    sendJson(response, 405, { ok: false })
    return
  }

  try {
    const header = request.headers.authorization
    const token = typeof header === 'string' && header.startsWith('Bearer ') ? header.slice('Bearer '.length) : ''

    if (!token) {
      sendJson(response, 401, { ok: false })
      return
    }

    const decoded = await adminAuth.verifyIdToken(token)
    const email = normalizeEmail(decoded.email)
    const isGoogle = decoded.email_verified === true && decoded.firebase.sign_in_provider === 'google.com'
    const adminSnapshot = isGoogle ? await adminDb.doc(`adminUsers/${decoded.uid}`).get() : null
    const isAdmin = Boolean(adminSnapshot?.exists && adminSnapshot.get('enabled') === true)

    sendJson(response, 200, { ok: true, isAdmin, isSchoolUser: isGoogle && email.endsWith('@dimigo.hs.kr') })
  } catch {
    sendJson(response, 401, { ok: false })
  }
}
