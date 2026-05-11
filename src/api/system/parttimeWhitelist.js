import request from '@/utils/request'

export function addParttimeWhitelist(data) {
  return request({
    url: '/system/parttime-whitelist',
    method: 'post',
    data,
  })
}
