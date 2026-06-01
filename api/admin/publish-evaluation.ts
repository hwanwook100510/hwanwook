import { adminDb, readBody, requireAdmin, sendJson, writeAuditLog } from '../_lib/firebaseAdmin'
import type { ApiRequest, ApiResponse } from '../_lib/firebaseAdmin'

const keys = ['promise', 'communication', 'event', 'reflection'] as const

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== 'POST') {
    sendJson(response, 405, { ok: false })
    return
  }

  try {
    const admin = await requireAdmin(request)
    await readBody(request)
    const snapshot = await adminDb.collection('evaluationResponses').get()
    const responses = snapshot.docs.map((doc) => doc.data())
    const count = responses.length
    const summary = Object.fromEntries(keys.map((key) => [key, count === 0 ? 0 : responses.reduce((sum, item) => sum + (Number.isInteger(item[key]) ? item[key] : 0), 0) / count]))

    await Promise.all([
      adminDb.doc('publicStats/evaluationSummary').set({ ...summary, count }),
      writeAuditLog('evaluation_publish', admin.uid),
    ])

    sendJson(response, 200, { ok: true })
  } catch {
    sendJson(response, 403, { ok: false, message: '요청을 처리할 권한이 없습니다.' })
  }
}
