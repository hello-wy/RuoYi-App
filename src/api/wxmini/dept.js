import request from '@/utils/request'

export function listWxminiDept(query = {}) {
  return request({
    url: '/wxmini/dept/list',
    method: 'get',
    params: query
  })
}
