import request from '@/utils/request'

export function getWxUserProfileDetail() {
  return request({
    url: '/wxmini/profile/detail',
    method: 'get'
  })
}

export function updateWxUserProfile(data) {
  return request({
    url: '/wxmini/profile',
    method: 'put',
    data
  })
}

export function initWxUserType(data) {
  return request({
    url: '/wxmini/profile/user-type/init',
    method: 'post',
    data
  })
}

export function switchWxUserType(data) {
  return request({
    url: '/wxmini/profile/user-type',
    method: 'put',
    data
  })
}
