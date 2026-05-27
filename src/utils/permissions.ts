export function normalizeEmail(email: string | null | undefined) {
  return email?.toLowerCase() ?? ''
}

const configuredAdminEmails = import.meta.env.VITE_ADMIN_EMAILS
  ?.split(',')
  .map((email: string) => normalizeEmail(email.trim()))
  .filter(Boolean)

export const ADMIN_EMAILS = configuredAdminEmails?.length ? configuredAdminEmails : ['hwanwook100510@gmail.com']
export const ADMIN_EMAIL = ADMIN_EMAILS[0]

export function isAdminEmail(email: string | null | undefined) {
  return ADMIN_EMAILS.includes(normalizeEmail(email))
}
