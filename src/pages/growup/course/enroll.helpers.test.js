import { describe, expect, test } from 'vitest'
import {
  buildCourseTimeText,
  buildCourseEnrollmentText,
  courseRequiresEnrollment,
  canSubmitCourseEnrollment
} from './enroll.helpers'

describe('course enroll helpers', () => {
  test('builds course time text from lecture time and endDate fields', () => {
    expect(buildCourseTimeText({
      time: '2026-06-12 09:00',
      endDate: '2026-06-13 18:00'
    })).toBe('2026.06.12-2026.06.13')
  })

  test('shows explicit unset text when course time is missing', () => {
    expect(buildCourseTimeText({})).toBe('未设置')
  })

  test('treats courses as requiring enrollment unless explicitly disabled', () => {
    expect(courseRequiresEnrollment({})).toBe(true)
    expect(courseRequiresEnrollment({ requiresEnrollment: true })).toBe(true)
    expect(courseRequiresEnrollment({ requiresEnrollment: 1 })).toBe(true)
    expect(courseRequiresEnrollment({ requiresEnrollment: false })).toBe(false)
    expect(courseRequiresEnrollment({ requiresEnrollment: 0 })).toBe(false)
  })

  test('builds current course enrollment balance text', () => {
    expect(buildCourseEnrollmentText({ remain: 3 })).toBe('剩余 3 次')
    expect(buildCourseEnrollmentText(null)).toBe('暂无可用学籍')
  })

  test('blocks submit when required course enrollment is missing or empty', () => {
    expect(canSubmitCourseEnrollment({ course: {}, enrollment: null }).ok).toBe(false)
    expect(canSubmitCourseEnrollment({ course: {}, enrollment: { remain: 0 } }).ok).toBe(false)
    expect(canSubmitCourseEnrollment({ course: {}, enrollment: { remain: 1 } }).ok).toBe(true)
  })

  test('allows submit without enrollment when course disables enrollment requirement', () => {
    const result = canSubmitCourseEnrollment({
      course: { requiresEnrollment: false },
      enrollment: null
    })

    expect(result.ok).toBe(true)
  })
})
