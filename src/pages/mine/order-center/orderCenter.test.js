import { describe, expect, test } from 'vitest'
import {
  ORDER_TYPE_OPTIONS,
  STATUS_FILTER_OPTIONS,
  filterOrdersByStatus,
  getStatusLabel,
  mapCourseStatus,
} from './orderCenter'

describe('order center course orders', () => {
  test('exposes course type and sign-in status filters', () => {
    expect(ORDER_TYPE_OPTIONS.map(item => item.key)).toContain('course')
    expect(STATUS_FILTER_OPTIONS.map(item => item.key)).toContain('signIn')
  })

  test('maps course pay order numeric statuses', () => {
    expect(mapCourseStatus(0)).toBe('pending')
    expect(mapCourseStatus(1)).toBe('paid')
    expect(mapCourseStatus(2)).toBe('signIn')
    expect(mapCourseStatus(3)).toBe('refunded')
    expect(mapCourseStatus(4)).toBe('canceled')
  })

  test('labels and filters course sign-in orders', () => {
    const orders = [
      { orderNo: 'C1', statusKey: 'paid' },
      { orderNo: 'C2', statusKey: 'signIn' },
    ]

    expect(getStatusLabel('signIn')).toBe('已签到')
    expect(filterOrdersByStatus(orders, 'signIn')).toEqual([
      { orderNo: 'C2', statusKey: 'signIn' },
    ])
  })
})
