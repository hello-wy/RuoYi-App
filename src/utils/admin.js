export const ADMIN_ROLE = 'admin'

export function hasAdminRole(roles = []) {
  return Array.isArray(roles) && roles.includes(ADMIN_ROLE)
}

export function isAdminUser(token, roles = []) {
  return Boolean(token) && hasAdminRole(roles)
}

export function shouldEnableRegularMineFeatures(token, roles = []) {
  return !isAdminUser(token, roles)
}
