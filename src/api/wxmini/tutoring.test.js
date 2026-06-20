import { describe, expect, test, vi } from 'vitest'

vi.mock('@/utils/request', () => ({
  default: vi.fn(config => config)
}))

vi.mock('@/utils/upload', () => ({
  default: vi.fn(config => config)
}))

describe('wxmini tutoring api', () => {
  test('submits student tutoring schedule check-in', async () => {
    const { submitStudentScheduleCheckIn } = await import('./tutoring')

    expect(submitStudentScheduleCheckIn(60001, { remark: '已到达上课地点' })).toEqual({
      url: '/wxmini/tutoring/schedules/60001/finish',
      method: 'post',
      data: { remark: '已到达上课地点' }
    })
  })

  test('submits parent tutoring schedule completion', async () => {
    const { submitParentScheduleComplete } = await import('./tutoring')

    expect(submitParentScheduleComplete(60001, { remark: '确认上课完成' })).toEqual({
      url: '/wxmini/tutoring/schedules/60001/confirm',
      method: 'post',
      data: { remark: '确认上课完成' }
    })
  })
})
