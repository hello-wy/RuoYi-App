import request from '@/utils/request'

export function listJobSignAuditRecords(query) {
  return request({
    url: '/system/job-sign-audit/list',
    adminAuth: true,
    method: 'get',
    params: query
  })
}

export function auditJobSignRecord(id, auditStatus, auditRemark = '') {
  return request({
    url: '/system/job-sign-audit/' + id + '/audit',
    adminAuth: true,
    method: 'post',
    data: { auditStatus, auditRemark }
  })
}
