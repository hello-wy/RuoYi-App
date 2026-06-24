import request from '@/utils/request'

export function getAdminBinding() {
  return request({
    url: '/wxmini/auth/admin-binding',
    method: 'get'
  })
}

export function bindAdmin(data) {
  return request({
    url: '/wxmini/auth/admin-binding',
    method: 'post',
    data
  })
}

export function unbindAdmin() {
  return request({
    url: '/wxmini/auth/admin-binding',
    method: 'delete'
  })
}

export function getAdminToken() {
  return request({
    url: '/wxmini/auth/admin-token',
    method: 'get'
  })
}
