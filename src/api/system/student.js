import request from '@/utils/request'

export function listStudents(params) {
  return request({
    url: '/system/student/list',
    method: 'get',
    params
  })
}

export function getStudentDetail(id) {
  return request({
    url: '/system/student/' + id,
    method: 'get'
  })
}
