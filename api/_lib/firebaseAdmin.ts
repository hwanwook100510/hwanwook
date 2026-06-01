import { createHmac } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { getApps, initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

type JsonBody = Record<string, unknown>

type RequestWithBody = IncomingMessage & {
  body?: unknown
}

export type ApiRequest = RequestWithBody
export type ApiResponse = ServerResponse & {
  status: (code: number) => ApiResponse
  json: (body: unknown) => void
}

function initAdminApp() {
  if (getApps().length > 0) return

  const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON

  if (!rawServiceAccount) {
    initializeApp()
    return
  }

  initializeApp({ credential: cert(JSON.parse(rawServiceAccount)) })
}

initAdminApp()

export const adminAuth = getAuth()
export const adminDb = getFirestore()

export function normalizeEmail(value: unknown) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

export function maskEmail(email: string) {
  const [name, domain] = email.split('@')
  if (!name || !domain) return 'unknown'
  const visible = name.slice(0, 2)
  return `${visible}${'*'.repeat(Math.max(2, name.length - visible.length))}@${domain}`
}

export function emailHash(email: string) {
  const secret = process.env.EMAIL_BLOCKLIST_HMAC_SECRET

  if (!secret) {
    throw new Error('Missing EMAIL_BLOCKLIST_HMAC_SECRET')
  }

  return createHmac('sha256', secret).update(email).digest('hex')
}

export function sendJson(response: ApiResponse, status: number, body: unknown) {
  response.status(status).json(body)
}

export async function readBody(request: ApiRequest): Promise<JsonBody> {
  if (request.body && typeof request.body === 'object') return request.body as JsonBody

  const chunks: Buffer[] = []

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  if (chunks.length === 0) return {}

  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as JsonBody
}

export async function requireAdmin(request: ApiRequest) {
  const header = request.headers.authorization
  const token = typeof header === 'string' && header.startsWith('Bearer ') ? header.slice('Bearer '.length) : ''

  if (!token) {
    throw new Error('UNAUTHORIZED')
  }

  const decoded = await adminAuth.verifyIdToken(token)
  const provider = decoded.firebase.sign_in_provider

  if (decoded.email_verified !== true || provider !== 'google.com') {
    throw new Error('FORBIDDEN')
  }

  const adminSnapshot = await adminDb.doc(`adminUsers/${decoded.uid}`).get()

  if (!adminSnapshot.exists || adminSnapshot.get('enabled') !== true) {
    throw new Error('FORBIDDEN')
  }

  return decoded
}

export async function writeAuditLog(action: string, performedByUid: string, targetHash?: string) {
  await adminDb.collection('securityAuditLogs').add({
    action,
    targetHash: targetHash ?? null,
    performedByUid,
    createdAt: FieldValue.serverTimestamp(),
  })
}

export { FieldValue }
