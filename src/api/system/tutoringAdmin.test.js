import { describe, expect, test, vi } from 'vitest'

vi.mock('@/utils/request', () => ({
  default: vi.fn(config => config)
}))

describe('tutoring admin api', () => {
  test('lists tutoring schedules with admin filters', async () => {
    const { listTutoringSchedules } = await import('./tutoringAdmin')

    expect(listTutoringSchedules({ status: 1, confirmed: true })).toEqual({
      url: '/system/tutoring-admin/schedules/list',
      method: 'get',
      params: { status: 1, confirmed: true }
    })
  })

  test('submits tutoring schedule audit decision', async () => {
    const { auditTutoringSchedule } = await import('./tutoringAdmin')

    expect(auditTutoringSchedule(60001, { remark: '确认课时无误' })).toEqual({
      url: '/system/tutoring-admin/schedules/60001/audit',
      method: 'post',
      data: { targetStatus: 2, remark: '确认课时无误' }
    })
  })
})
