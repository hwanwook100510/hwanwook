export function normalizeAdminRoute(value: string | undefined) {
  const trimmed = value?.trim()

  if (!trimmed || trimmed === '/') {
    return ''
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

export const adminRoute = normalizeAdminRoute(import.meta.env.VITE_ADMIN_ROUTE)

export const externalLoginEmails = (import.meta.env.VITE_EXTERNAL_LOGIN_EMAILS ?? '')
  .split(',')
  .map((email: string) => email.trim().toLowerCase())
  .filter(Boolean)
