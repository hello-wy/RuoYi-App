import request from '@/utils/request'

export function listBaby() {
  return request({
    url: '/wxmini/baby/list',
    method: 'get'
  })
}

export function getBaby(id) {
  return request({
    url: '/wxmini/baby/' + id,
    method: 'get'
  })
}

export function addBaby(data) {
  return request({
    url: '/wxmini/baby',
    method: 'post',
    data
  })
}

export function updateBaby(data) {
  return request({
    url: '/wxmini/baby',
    method: 'put',
    data
  })
}

export function deleteBaby(id) {
  return request({
    url: '/wxmini/baby/' + id,
    method: 'delete'
  })
}
