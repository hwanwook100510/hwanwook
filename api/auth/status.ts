import { adminAuth, adminDb, normalizeEmail, sendJson } from '../_lib/firebaseAdmin'
import type { ApiRequest, ApiResponse } from '../_lib/firebaseAdmin'

const externalLoginEmails = (process.env.EXTERNAL_LOGIN_EMAILS ?? '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

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
    const isSchoolUser = isGoogle && email.endsWith('@dimigo.hs.kr')
    const isExternalAllowed = isGoogle && externalLoginEmails.includes(email)

    sendJson(response, 200, { ok: true, isAdmin, isSchoolUser, isExternalAllowed, isAllowedLogin: isAdmin || isSchoolUser || isExternalAllowed })
  } catch {
    sendJson(response, 401, { ok: false })
  }
}
