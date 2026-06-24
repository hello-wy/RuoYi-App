import request from '@/utils/request'

export function adminLogin(username, password) {
  return request({
    url: '/login',
    headers: {
      isToken: false
    },
    method: 'post',
    data: {
      username,
      password
    }
  })
}

export function getAdminInfo() {
  return request({
    url: '/getInfo',
    adminAuth: true,
    method: 'get'
  })
}
