import { describe, expect, test } from 'vitest'
import {
  buildAttendanceStatus,
  canUploadAttendanceImage,
  getAttendanceRejectReason,
  getAttendanceImageUrl,
} from './schedules.helpers'

describe('job schedules attendance helpers', () => {
  test('builds attendance status for unsubmitted, pending, approved and rejected records', () => {
    expect(buildAttendanceStatus({})).toEqual({ label: '未提交', type: 'empty' })
    expect(buildAttendanceStatus({ auditStatus: 0, signImageUrl: '/profile/job-sign/a.jpg' })).toEqual({ label: '待审核', type: 'pending' })
    expect(buildAttendanceStatus({ auditStatus: 1, signImageUrl: '/profile/job-sign/a.jpg' })).toEqual({ label: '已通过', type: 'approved' })
    expect(buildAttendanceStatus({ auditStatus: 2, signImageUrl: '/profile/job-sign/a.jpg' })).toEqual({ label: '已驳回', type: 'rejected' })
  })

  test('keeps backend attendance status labels while allowing unsubmitted records to upload', () => {
    expect(buildAttendanceStatus({ attendanceStatusLabel: '未签到', attendanceStatus: 0 })).toEqual({ label: '未签到', type: 'empty' })
    expect(buildAttendanceStatus({ attendanceStatusLabel: '已签到', attendanceStatus: 1 })).toEqual({ label: '已签到', type: 'approved' })
  })

  test('allows upload only before submission or after rejection', () => {
    expect(canUploadAttendanceImage({})).toBe(true)
    expect(canUploadAttendanceImage({ auditStatus: 2, signImageUrl: '/profile/job-sign/a.jpg' })).toBe(true)
    expect(canUploadAttendanceImage({ auditStatus: 0, signImageUrl: '/profile/job-sign/a.jpg' })).toBe(false)
    expect(canUploadAttendanceImage({ auditStatus: 1, signImageUrl: '/profile/job-sign/a.jpg' })).toBe(false)
  })

  test('normalizes uploaded attendance image url from backend-compatible fields', () => {
    expect(getAttendanceImageUrl({ signImageUrl: ' /profile/job-sign/a.jpg ' })).toBe('/profile/job-sign/a.jpg')
    expect(getAttendanceImageUrl({ materialUrls: ['/profile/job-sign/b.jpg'] })).toBe('/profile/job-sign/b.jpg')
    expect(getAttendanceImageUrl({ signMaterialUrl: '/profile/job-sign/c.jpg' })).toBe('/profile/job-sign/c.jpg')
  })

  test('returns rejection reason only for rejected records', () => {
    expect(getAttendanceRejectReason({ auditStatus: 2, auditRemark: '图片不清晰' })).toBe('图片不清晰')
    expect(getAttendanceRejectReason({ auditStatus: 2, rejectReason: '缺少现场信息' })).toBe('缺少现场信息')
    expect(getAttendanceRejectReason({ auditStatus: 0, auditRemark: '等待审核' })).toBe('')
  })
})
