import request from '@/utils/request'

export function addParttimeWhitelist(data) {
  return request({
    url: '/system/parttime-whitelist',
    adminAuth: true,
    method: 'post',
    data,
  })
}

export function listParttimeWhitelist(params) {
  return request({
    url: '/system/parttime-whitelist/list',
    adminAuth: true,
    method: 'get',
    params,
  })
}

export function deleteParttimeWhitelist(id) {
  return request({
    url: '/system/parttime-whitelist/' + id,
    adminAuth: true,
    method: 'delete',
  })
}
