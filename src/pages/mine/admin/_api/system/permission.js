import request from '@/utils/request'

const BASE_URL = '/system/permission-management'

export function getPermissionCatalog() {
  return request({
    url: `${BASE_URL}/catalog`,
    method: 'get',
    adminAuth: true
  })
}

export function listPermissionUsers(params = {}) {
  return request({
    url: `${BASE_URL}/users`,
    method: 'get',
    params,
    adminAuth: true
  })
}

export function getUserPermissions(userId) {
  return request({
    url: `${BASE_URL}/users/${userId}`,
    method: 'get',
    adminAuth: true
  })
}

export function updateUserPermissions(userId, permissionIds = []) {
  return request({
    url: `${BASE_URL}/users/${userId}`,
    method: 'put',
    data: { permissionIds },
    adminAuth: true
  })
}
