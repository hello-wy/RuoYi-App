import request from '@/utils/request'

export function listDept(query = {}) {
  return request({
    url: '/system/dept/list',
    adminAuth: true,
    method: 'get',
    params: query
  })
}

export function getDept(deptId) {
  return request({
    url: `/system/dept/${deptId}`,
    adminAuth: true,
    method: 'get'
  })
}

export function listDeptExclude(deptId) {
  return request({
    url: `/system/dept/list/exclude/${deptId}`,
    adminAuth: true,
    method: 'get'
  })
}

export function addDept(data) {
  return request({
    url: '/system/dept',
    adminAuth: true,
    method: 'post',
    data
  })
}

export function updateDept(data) {
  return request({
    url: '/system/dept',
    adminAuth: true,
    method: 'put',
    data
  })
}

export function deleteDept(deptId) {
  return request({
    url: `/system/dept/${deptId}`,
    adminAuth: true,
    method: 'delete'
  })
}

export function normalizeDeptOptions(depts = []) {
  return depts
    .filter(item => item && item.status !== '1')
    .map(item => ({
      value: item.deptId,
      text: item.deptName,
      raw: item
    }))
}
