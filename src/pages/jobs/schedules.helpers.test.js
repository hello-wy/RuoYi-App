import { describe, expect, test } from 'vitest'
import {
  buildAttendanceStatus,
  buildTutoringScheduleStatus,
  canParentConfirmTutoringSchedule,
  canStudentCheckInTutoringSchedule,
  canUploadAttendanceImage,
  getAttendanceRejectReason,
  getAttendanceImageUrl,
} from './schedules.helpers'

describe('job schedules attendance helpers', () => {
  test('builds attendance status for unsubmitted, pending, approved and rejected records', () => {
    expect(buildAttendanceStatus({})).toEqual({ label: '未提交', type: 'empty' })
    expect(buildAttendanceStatus({ auditStatus: 1, signImageUrl: '/profile/job-sign/a.jpg' })).toEqual({ label: '待审核', type: 'pending' })
    expect(buildAttendanceStatus({ auditStatus: 2, signImageUrl: '/profile/job-sign/a.jpg' })).toEqual({ label: '已通过', type: 'approved' })
    expect(buildAttendanceStatus({ auditStatus: 3, signImageUrl: '/profile/job-sign/a.jpg' })).toEqual({ label: '已驳回', type: 'rejected' })
  })

  test('keeps backend attendance status labels while allowing unsubmitted records to upload', () => {
    expect(buildAttendanceStatus({ attendanceStatusLabel: '未签到', attendanceStatus: 0 })).toEqual({ label: '未签到', type: 'empty' })
    expect(buildAttendanceStatus({ attendanceStatusLabel: '已签到', attendanceStatus: 1 })).toEqual({ label: '已签到', type: 'approved' })
  })

  test('allows upload only before submission or after rejection', () => {
    expect(canUploadAttendanceImage({})).toBe(true)
    expect(canUploadAttendanceImage({ auditStatus: 3, signImageUrl: '/profile/job-sign/a.jpg' })).toBe(true)
    expect(canUploadAttendanceImage({ auditStatus: 1, signImageUrl: '/profile/job-sign/a.jpg' })).toBe(false)
    expect(canUploadAttendanceImage({ auditStatus: 2, signImageUrl: '/profile/job-sign/a.jpg' })).toBe(false)
  })

  test('normalizes uploaded attendance image url from backend-compatible fields', () => {
    expect(getAttendanceImageUrl({ signImageUrl: ' /profile/job-sign/a.jpg ' })).toBe('/profile/job-sign/a.jpg')
    expect(getAttendanceImageUrl({ materialUrls: ['/profile/job-sign/b.jpg'] })).toBe('/profile/job-sign/b.jpg')
    expect(getAttendanceImageUrl({ signMaterialUrl: '/profile/job-sign/c.jpg' })).toBe('/profile/job-sign/c.jpg')
  })

  test('returns rejection reason only for rejected records', () => {
    expect(getAttendanceRejectReason({ auditStatus: 3, auditRemark: '图片不清晰' })).toBe('图片不清晰')
    expect(getAttendanceRejectReason({ auditStatus: 3, rejectReason: '缺少现场信息' })).toBe('缺少现场信息')
    expect(getAttendanceRejectReason({ auditStatus: 1, auditRemark: '等待审核' })).toBe('')
  })

  test('builds tutoring schedule status for default and explicit backend labels', () => {
    expect(buildTutoringScheduleStatus({ status: 0 })).toEqual({ label: '待上课', type: 'pending' })
    expect(buildTutoringScheduleStatus({ status: 1 })).toEqual({ label: '正在上课', type: 'warning' })
    expect(buildTutoringScheduleStatus({ status: 1, statusLabel: '待家长确认' })).toEqual({ label: '正在上课', type: 'warning' })
    expect(buildTutoringScheduleStatus({ status: 1, confirmTime: '2026-05-20 20:30:00' })).toEqual({ label: '待管理员审核', type: 'pending' })
    expect(buildTutoringScheduleStatus({ status: 2 })).toEqual({ label: '待结算', type: 'approved' })
    expect(buildTutoringScheduleStatus({ status: 2, statusLabel: '管理员审稿中' })).toEqual({ label: '管理员审稿中', type: 'approved' })
    expect(buildTutoringScheduleStatus({ status: 3 })).toEqual({ label: '已结算', type: 'approved' })
  })

  test('allows student check-in only before class starts', () => {
    expect(canStudentCheckInTutoringSchedule({ status: 0 })).toBe(true)
    expect(canStudentCheckInTutoringSchedule({ status: 0, canStudentComplete: true })).toBe(true)
    expect(canStudentCheckInTutoringSchedule({ status: 0, canStudentComplete: false })).toBe(false)
    expect(canStudentCheckInTutoringSchedule({ status: 1, canStudentComplete: true })).toBe(false)
    expect(canStudentCheckInTutoringSchedule({ status: 0, finishTime: '2026-05-20 18:00:00' })).toBe(false)
  })

  test('shows student check-in only for student identity', () => {
    expect(canStudentCheckInTutoringSchedule({ status: 0 }, 1)).toBe(true)
    expect(canStudentCheckInTutoringSchedule({ status: 0 }, 0)).toBe(false)
  })

  test('prevents repeated parent confirmation after confirmation was submitted', () => {
    expect(canParentConfirmTutoringSchedule({ status: 1 })).toBe(true)
    expect(canParentConfirmTutoringSchedule({ status: 1, confirmTime: '2026-05-20 20:30:00' })).toBe(false)
    expect(canParentConfirmTutoringSchedule({ status: 1, canParentConfirm: true, parentConfirmTime: '2026-05-20 20:30:00' })).toBe(false)
  })

  test('shows parent completion only for parent identity', () => {
    expect(canParentConfirmTutoringSchedule({ status: 1 }, 0)).toBe(true)
    expect(canParentConfirmTutoringSchedule({ status: 1 }, 1)).toBe(false)
  })
})
