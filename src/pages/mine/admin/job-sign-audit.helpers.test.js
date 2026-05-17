import { describe, expect, test } from 'vitest'
import {
  buildJobSignAuditActionLabel,
  buildJobSignAuditStatus,
  canAuditJobSignRecord,
  canRefundJobOrder,
  getJobSignAuditMaterialUrls,
} from './job-sign-audit.helpers'

describe('job sign audit helpers', () => {
  test('hides audit action when sign material has not been submitted', () => {
    expect(canAuditJobSignRecord({ submitted: false, auditStatus: 0 })).toBe(false)
    expect(canAuditJobSignRecord({ materialUrls: [] })).toBe(false)
  })

  test('shows audit action only for submitted pending sign material', () => {
    expect(canAuditJobSignRecord({ submitted: true, auditStatus: 1 })).toBe(true)
    expect(canAuditJobSignRecord({ materialUrls: ['https://example.com/a.jpg'], auditStatus: 1 })).toBe(true)
    expect(canAuditJobSignRecord({ submitted: true, auditStatus: 2 })).toBe(false)
    expect(canAuditJobSignRecord({ submitted: true, auditStatus: 3 })).toBe(false)
  })

  test('builds status label and type from submission and audit state', () => {
    expect(buildJobSignAuditStatus({ submitted: false })).toEqual({ label: '未提交', type: 'empty' })
    expect(buildJobSignAuditStatus({ submitted: true, auditStatus: 1 })).toEqual({ label: '待审核', type: 'pending' })
    expect(buildJobSignAuditStatus({ submitted: true, auditStatus: 2 })).toEqual({ label: '已通过', type: 'approved' })
    expect(buildJobSignAuditStatus({ submitted: true, auditStatus: 3 })).toEqual({ label: '已驳回', type: 'rejected' })
  })

  test('normalizes material urls from arrays or comma-separated strings', () => {
    expect(getJobSignAuditMaterialUrls({ materialUrls: [' a ', '', 'b'] })).toEqual(['a', 'b'])
    expect(getJobSignAuditMaterialUrls({ materialUrls: 'a, b,,c' })).toEqual(['a', 'b', 'c'])
    expect(getJobSignAuditMaterialUrls({ materialUrl: 'single' })).toEqual(['single'])
  })

  test('allows job refund only after sign audit is approved', () => {
    expect(canRefundJobOrder({ status: 1, canRefund: true })).toBe(true)
    expect(canRefundJobOrder({ status: 1, signAuditStatus: 2 })).toBe(false)
    expect(canRefundJobOrder({ status: 1, auditStatus: 2 })).toBe(false)
    expect(canRefundJobOrder({ status: 1, signedIn: true })).toBe(false)
    expect(canRefundJobOrder({ status: 3, canRefund: false })).toBe(false)
    expect(canRefundJobOrder({ status: 1, canRefund: false })).toBe(false)
  })

  test('returns audit action labels', () => {
    expect(buildJobSignAuditActionLabel(2)).toBe('通过')
    expect(buildJobSignAuditActionLabel(3)).toBe('驳回')
  })
})
