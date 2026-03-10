import request from '@/utils/request'


export function getMyRecords() {
  return request({
    url: '/system/record/myRecords',
    method: 'get'
  })
}