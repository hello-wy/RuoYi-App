import { describe, expect, test, vi } from 'vitest'

vi.mock('@/utils/request', () => ({
  default: vi.fn(config => config)
}))

describe('job sign audit api', () => {
  test('lists paid job signup sign materials by job id', async () => {
    const { listJobSignAuditRecords } = await import('./jobSignAudit')

    expect(listJobSignAuditRecords({ jobId: 18, pageNum: 1, pageSize: 20 })).toEqual({
      url: '/system/job-sign-audit/list',
      method: 'get',
      params: { jobId: 18, pageNum: 1, pageSize: 20 }
    })
  })

  test('submits an audit decision for a signup record', async () => {
    const { auditJobSignRecord } = await import('./jobSignAudit')

    expect(auditJobSignRecord(9, 1)).toEqual({
      url: '/system/job-sign-audit/9/audit',
      method: 'post',
      data: { auditStatus: 1 }
    })
  })
})
