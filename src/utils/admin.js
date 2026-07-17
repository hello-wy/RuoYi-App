import { getAdminToken } from '@/utils/auth'

export const ADMIN_ROLE = 'admin'
export const NATIONAL_GENERAL_MANAGER_ROLE = 'national_general_manager'

export function hasAdminRole(roles = []) {
  return Array.isArray(roles) && roles.some(role => (
    role === ADMIN_ROLE || role === NATIONAL_GENERAL_MANAGER_ROLE
  ))
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
