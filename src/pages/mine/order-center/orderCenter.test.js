import { describe, expect, test } from 'vitest'
import {
  ORDER_TYPE_OPTIONS,
  STATUS_FILTER_OPTIONS,
  filterOrdersByStatus,
  filterOrdersByType,
  formatOrderDateTime,
  getEmptyText,
  getStatusLabel,
  isDisplayableOrderStatus,
  mapCourseStatus,
  mapTutoringStatus,
  resolveOrderCenterInitialFilters,
  sortOrders
} from './orderCenter'

describe('order center helpers', () => {
  test('includes course and tutoring package order types', () => {
    expect(ORDER_TYPE_OPTIONS).toContainEqual({ key: 'course', label: '课程订单' })
    expect(ORDER_TYPE_OPTIONS).toContainEqual({ key: 'tutoringPackage', label: '家教课时包' })
  })

  test('exposes course sign-in status filter', () => {
    expect(STATUS_FILTER_OPTIONS.map(item => item.key)).toContain('signIn')
  })

  test('maps course pay order numeric statuses', () => {
    expect(mapCourseStatus(0)).toBe('pending')
    expect(mapCourseStatus(1)).toBe('paid')
    expect(mapCourseStatus(2)).toBe('signIn')
    expect(mapCourseStatus(3)).toBe('refunded')
    expect(mapCourseStatus(4)).toBe('canceled')
  })

  test('maps tutoring package statuses to order center filters', () => {
    expect(mapTutoringStatus(1)).toBe('paid')
    expect(mapTutoringStatus(0)).toBe('pending')
    expect(mapTutoringStatus(2)).toBe('canceled')
    expect(getStatusLabel('pending')).toBe('待支付')
  })

  test('only exposes displayable order statuses in the order center', () => {
    expect(isDisplayableOrderStatus('paid')).toBe(true)
    expect(isDisplayableOrderStatus('refunded')).toBe(true)
    expect(isDisplayableOrderStatus('pending')).toBe(false)
    expect(isDisplayableOrderStatus('canceled')).toBe(false)
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

  test('filters tutoring package orders by type', () => {
    const orders = [
      { id: 'salon-1', type: 'salon' },
      { id: 'tutoring-package-1', type: 'tutoringPackage' }
    ]

    expect(filterOrdersByType(orders, 'tutoringPackage')).toEqual([
      { id: 'tutoring-package-1', type: 'tutoringPackage' }
    ])
  })

  test('builds empty text for tutoring package orders', () => {
    expect(getEmptyText('tutoringPackage', 'all')).toBe('暂无家教课时包')
  })

  test('uses route query to open paid tutoring package orders', () => {
    expect(resolveOrderCenterInitialFilters({
      type: 'tutoringPackage',
      status: 'paid'
    })).toEqual({
      type: 'tutoringPackage',
      status: 'paid'
    })
  })

  test('formats backend date time without relying on iOS Date parsing', () => {
    expect(formatOrderDateTime('2026-05-23 17:33:00')).toBe('2026-05-23 17:33')
    expect(formatOrderDateTime('2026-05-23')).toBe('2026-05-23 00:00')
  })

  test('sorts backend date time strings without relying on iOS Date parsing', () => {
    const sorted = sortOrders([
      { id: 'older', createTime: '2026-05-23 17:33:00' },
      { id: 'newer', createTime: '2026-05-23 18:00:00' }
    ])

    expect(sorted.map(item => item.id)).toEqual(['newer', 'older'])
  })
})
