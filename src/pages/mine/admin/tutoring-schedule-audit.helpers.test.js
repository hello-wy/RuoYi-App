import { describe, expect, test } from 'vitest'
import {
  buildTutoringAuditStatus,
  canAuditTutoringSchedule,
  formatScheduleAmount,
  formatScheduleTime,
  normalizeTutoringScheduleRows
} from './tutoring-schedule-audit.helpers'

describe('tutoring schedule audit helpers', () => {
  test('allows audit only after parent confirmation in current schedule list flow', () => {
    expect(canAuditTutoringSchedule({ status: 1 })).toBe(false)
    expect(canAuditTutoringSchedule({ status: 1, confirmTime: '2026-05-20 20:30:00' })).toBe(true)
    expect(canAuditTutoringSchedule({ status: 2, confirmTime: '2026-05-20 20:30:00' })).toBe(false)
  })

  test('builds clear audit statuses', () => {
    expect(buildTutoringAuditStatus({ status: 1 })).toEqual({ label: '待家长确认', type: 'warning' })
    expect(buildTutoringAuditStatus({ status: 1, confirmTime: '2026-05-20 20:30:00' })).toEqual({ label: '待管理员审核', type: 'pending' })
    expect(buildTutoringAuditStatus({ status: 2 })).toEqual({ label: '待结算', type: 'approved' })
  })

  test('formats schedule display values', () => {
    const item = { serviceDate: '2026-05-20', startTime: '18:00', endTime: '20:00', netAmount: 216 }
    expect(formatScheduleTime(item)).toBe('2026-05-20 18:00-20:00')
    expect(formatScheduleAmount(item)).toBe('¥216.00')
  })

  test('normalizes admin tutor name from real name without masking', () => {
    const rows = normalizeTutoringScheduleRows([{
      realName: '实名李老师',
      tutorRealName: '李教员',
      tutorName: '昵称李同学'
    }])

    expect(rows[0].tutorName).toBe('实名李老师')
  })
})
