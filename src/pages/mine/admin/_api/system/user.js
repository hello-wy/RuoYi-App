import request from '@/utils/request'

export const ADMIN_LEVEL_OPTIONS = [
  { label: '员工', value: 'employee' },
  { label: '经理', value: 'manager' },
  { label: '总经理', value: 'city_general_manager' },
  { label: '区域总经理', value: 'province_general_manager' },
  { label: '全国总经理', value: 'national_general_manager' }
]

export function listSystemUsers(query = {}) {
  return request({
    url: '/system/user/list',
    adminAuth: true,
    method: 'get',
    params: query
  })
}

export function getSystemUser(userId) {
  return request({
    url: `/system/user/${userId || ''}`,
    adminAuth: true,
    method: 'get'
  })
}

export function addSystemUser(data) {
  return request({
    url: '/system/user',
    adminAuth: true,
    method: 'post',
    data
  })
}

export function updateSystemUser(data) {
  return request({
    url: '/system/user',
    adminAuth: true,
    method: 'put',
    data
  })
}

export function resetSystemUserPassword(userId, password) {
  return request({
    url: '/system/user/resetPwd',
    adminAuth: true,
    method: 'put',
    data: { userId, password }
  })
}

export function deleteSystemUser(userId) {
  return request({
    url: `/system/user/${userId}`,
    adminAuth: true,
    method: 'delete'
  })
}

export function changeSystemUserStatus(userId, status) {
  return request({
    url: '/system/user/changeStatus',
    adminAuth: true,
    method: 'put',
    data: { userId, status }
  })
}

export function updateSystemUserRoles(userId, roleIds = []) {
  return request({
    url: '/system/user/authRole',
    adminAuth: true,
    method: 'put',
    params: {
      userId,
      roleIds: roleIds.join(',')
    }
  })
}

export function getAdminLevelLabel(value) {
  return ADMIN_LEVEL_OPTIONS.find(item => item.value === value)?.label || '未设置'
}

export function buildCredentialText(credentials = {}) {
  return `手机号：${credentials.phone || ''}\n密码：${credentials.password || ''}`
}
