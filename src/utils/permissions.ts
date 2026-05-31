export function normalizeEmail(email: string | null | undefined) {
  return email?.toLowerCase() ?? ''
}

const configuredAdminEmails = import.meta.env.VITE_ADMIN_EMAILS
  ?.split(',')
  .map((email: string) => normalizeEmail(email.trim()))
  .filter(Boolean)

const DEFAULT_ADMIN_EMAILS = ['hwanwook100510@gmail.com']

// UI 표시용 보조 판단입니다. 실제 관리자 권한은 Firestore Security Rules가 단일 소스입니다.
export const ADMIN_EMAILS = Array.from(new Set([...DEFAULT_ADMIN_EMAILS, ...(configuredAdminEmails ?? [])]))
export const ADMIN_EMAIL = ADMIN_EMAILS[0]

export function isAdminEmail(email: string | null | undefined) {
  return ADMIN_EMAILS.includes(normalizeEmail(email))
}
