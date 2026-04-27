import { describe, expect, test } from 'vitest'
import {
  buildTutorDetailBottomActions,
  buildTutorReviewDetailUrl,
  buildTutorReviewSummaryRows,
  getReviewResultToast,
  isTutorAuditMode,
} from './tutor-review.helpers'

describe('tutor review helpers', () => {
  test('builds the detail url with audit mode enabled', () => {
    expect(buildTutorReviewDetailUrl({ id: 18 })).toBe('/pages/tutoring/tutor/detail?id=18&auditMode=1')
  })

  test('treats only auditMode=1 as audit review mode', () => {
    expect(isTutorAuditMode({ auditMode: '1' })).toBe(true)
    expect(isTutorAuditMode({ auditMode: 1 })).toBe(true)
    expect(isTutorAuditMode({ auditMode: '0' })).toBe(false)
    expect(isTutorAuditMode({})).toBe(false)
  })

  test('builds only the four summary rows required by the review list', () => {
    expect(buildTutorReviewSummaryRows({
      realName: '王老师',
      school: '北京大学',
      major: '数学',
      methods: '1',
    }, [
      { value: '1', label: '线上' },
      { value: '2', label: '线下' },
    ])).toEqual([
      { label: '姓名', value: '王老师' },
      { label: '学校', value: '北京大学' },
      { label: '专业', value: '数学' },
      { label: '授课方式', value: '线上' },
    ])
  })

  test('falls back to default text when summary fields are empty', () => {
    expect(buildTutorReviewSummaryRows({}, [])).toEqual([
      { label: '姓名', value: '未填写姓名' },
      { label: '学校', value: '未填写' },
      { label: '专业', value: '未填写' },
      { label: '授课方式', value: '未填写' },
    ])
  })

  test('returns review toast text by status', () => {
    expect(getReviewResultToast(1)).toBe('已通过')
    expect(getReviewResultToast(2)).toBe('已拒绝')
  })

  test('returns the correct bottom action labels for audit and normal detail modes', () => {
    expect(buildTutorDetailBottomActions(true)).toEqual([
      { key: 'reject', text: '拒绝', status: 2 },
      { key: 'pass', text: '通过', status: 1 },
    ])
    expect(buildTutorDetailBottomActions(false)).toEqual([
      { key: 'contact', text: '立即联系' },
    ])
  })
})

