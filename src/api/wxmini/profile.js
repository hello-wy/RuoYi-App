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
