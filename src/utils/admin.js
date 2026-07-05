import { getAdminToken } from '@/utils/auth'

export const ADMIN_ROLE = 'admin'

export function hasAdminRole(roles = []) {
  return Array.isArray(roles) && roles.includes(ADMIN_ROLE)
}

export function isAdminUser(token, roles = []) {
  if (!token) return false
  if (hasAdminRole(roles)) return true
  if (typeof uni === 'undefined') return false
  const adminToken = getAdminToken()
  return adminToken === token
}

export function shouldEnableRegularMineFeatures(token, roles = []) {
  return !isAdminUser(token, roles)
}
