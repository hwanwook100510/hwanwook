import { adminAuth, adminDb, emailHash, FieldValue, maskEmail, normalizeEmail, readBody, requireAdmin, sendJson, writeAuditLog } from '../_lib/firebaseAdmin'
import type { ApiRequest, ApiResponse } from '../_lib/firebaseAdmin'

const schoolOnly = process.env.EMAIL_BLOCKLIST_SCHOOL_ONLY !== 'false'

async function findUserUid(email: string) {
  try {
    const user = await adminAuth.getUserByEmail(email)
    return user.uid
  } catch {
    return ''
  }
}

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== 'POST') {
    sendJson(response, 405, { ok: false })
    return
  }

  try {
    const admin = await requireAdmin(request)
    const body = await readBody(request)
    const email = normalizeEmail(body.email)
    const action = body.action === 'unblock' ? 'unblock' : body.action === 'status' ? 'status' : 'block'

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      sendJson(response, 400, { ok: false, message: '이메일 형식을 확인해주세요.' })
      return
    }

    if (schoolOnly && !email.endsWith('@dimigo.hs.kr')) {
      sendJson(response, 400, { ok: false, message: '학교 이메일만 처리할 수 있습니다.' })
      return
    }

    const hash = emailHash(email)
    const blockedRef = adminDb.doc(`blockedEmailHashes/${hash}`)
    const uid = await findUserUid(email)
    const uidRef = uid ? adminDb.doc(`suspendedUsers/${uid}`) : null

    if (action === 'status') {
      const [blockedSnapshot, uidSnapshot] = await Promise.all([
        blockedRef.get(),
        uidRef ? uidRef.get() : Promise.resolve(null),
      ])

      sendJson(response, 200, {
        ok: true,
        blocked: blockedSnapshot.exists && blockedSnapshot.get('enabled') === true,
        uidSuspended: Boolean(uidSnapshot?.exists && uidSnapshot.get('enabled') === true),
        display: maskEmail(email),
      })
      return
    }

    if (action === 'block') {
      await blockedRef.set({
        enabled: true,
        display: maskEmail(email),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        createdByUid: admin.uid,
        updatedByUid: admin.uid,
      }, { merge: true })

      if (uidRef) {
        await uidRef.set({ enabled: true, emailHash: hash, suspendedAt: FieldValue.serverTimestamp(), suspendedByUid: admin.uid }, { merge: true })
      }

      await writeAuditLog('email_block', admin.uid, hash)
      sendJson(response, 200, { ok: true, message: '사용 중지 처리했습니다.', display: maskEmail(email) })
      return
    }

    await blockedRef.set({ enabled: false, updatedAt: FieldValue.serverTimestamp(), updatedByUid: admin.uid }, { merge: true })

    if (uidRef) {
      await uidRef.set({ enabled: false, restoredAt: FieldValue.serverTimestamp(), restoredByUid: admin.uid }, { merge: true })
    }

    await writeAuditLog('email_unblock', admin.uid, hash)
    sendJson(response, 200, { ok: true, message: '사용 중지를 해제했습니다.', display: maskEmail(email) })
  } catch {
    sendJson(response, 403, { ok: false, message: '요청을 처리할 권한이 없습니다.' })
  }
}
