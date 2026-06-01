export function normalizeAdminRoute(value: string | undefined) {
  const trimmed = value?.trim()

  if (!trimmed || trimmed === '/') {
    return ''
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

export const adminRoute = normalizeAdminRoute(import.meta.env.VITE_ADMIN_ROUTE)
