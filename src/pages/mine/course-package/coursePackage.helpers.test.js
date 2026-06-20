import { describe, expect, test } from 'vitest'
import {
  buildPaidTutoringPackageOrderCenterUrl,
  getSubmitText,
  isCoursePackageDetailMode
} from './coursePackage.helpers'

describe('course package helpers', () => {
  test('uses readonly detail mode when route contains an order number', () => {
    expect(isCoursePackageDetailMode({ orderNo: 'TUTOR-20260524' })).toBe(true)
    expect(isCoursePackageDetailMode({})).toBe(false)
  })

  test('does not expose create order text in readonly detail mode', () => {
    expect(getSubmitText({
      submitting: false,
      hasOrderNo: true,
      readonly: true
    })).toBe('')
  })

  test('builds paid tutoring package order center url after payment succeeds', () => {
    expect(buildPaidTutoringPackageOrderCenterUrl('TUTOR-20260524')).toBe(
      '/pages/mine/order-center/index?type=tutoringPackage&status=paid&orderNo=TUTOR-20260524'
    )
  })
})
