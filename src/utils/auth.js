const TokenKey = 'App-Token'
const AdminTokenKey = 'Admin-Token'
const AdminRolesKey = 'Admin-Roles'

export function getToken() {
  return uni.getStorageSync(TokenKey)
}

export function setToken(token) {
  return uni.setStorageSync(TokenKey, token)
}

export function removeToken() {
  return uni.removeStorageSync(TokenKey)
}

export function getAdminToken() {
  return uni.getStorageSync(AdminTokenKey)
}

export function setAdminToken(token) {
  return uni.setStorageSync(AdminTokenKey, token)
}

export function removeAdminToken() {
  return uni.removeStorageSync(AdminTokenKey)
}

export function getAdminRoles() {
  return uni.getStorageSync(AdminRolesKey) || []
}

export function setAdminRoles(roles) {
  return uni.setStorageSync(AdminRolesKey, roles)
}

export function removeAdminRoles() {
  return uni.removeStorageSync(AdminRolesKey)
}
