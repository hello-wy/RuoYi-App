import request from '@/utils/request'

export function addParttimeWhitelist(data) {
  return request({
    url: '/system/parttime-whitelist',
    method: 'post',
    data,
  })
}

export function listParttimeWhitelist(params) {
  return request({
    url: '/system/parttime-whitelist/list',
    method: 'get',
    params,
  })
}

export function deleteParttimeWhitelist(id) {
  return request({
    url: '/system/parttime-whitelist/' + id,
    method: 'delete',
  })
}
