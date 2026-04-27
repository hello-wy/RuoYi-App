import { describe, expect, test } from 'vitest'
import {
  buildBabyDisplayName,
  canUseBabyPicker,
  normalizeBabyList,
  shouldShowBabyEmptyState
} from './apply.helpers'

describe('parent apply helpers', () => {
  test('allows baby picker only for parent user type', () => {
    expect(canUseBabyPicker(0)).toBe(true)
    expect(canUseBabyPicker('0')).toBe(true)
    expect(canUseBabyPicker(1)).toBe(false)
    expect(canUseBabyPicker('')).toBe(false)
  })

  test('normalizes baby list items for display', () => {
    expect(normalizeBabyList([
      { id: 1, realName: '小明', nickName: '明明', grade: '一年级' },
      { id: 2, realName: '小红', birthDate: '2020-01-01' }
    ])).toEqual([
      { id: 1, realName: '小明', displayName: '小明（明明）', meta: '一年级' },
      { id: 2, realName: '小红', displayName: '小红', meta: '2020-01-01' }
    ])
  })

  test('builds fallback display name from available fields', () => {
    expect(buildBabyDisplayName({ realName: '小宇', nickName: '宇宇' })).toBe('小宇（宇宇）')
    expect(buildBabyDisplayName({ realName: '小宇', nickName: '' })).toBe('小宇')
    expect(buildBabyDisplayName({})).toBe('未命名萌娃')
  })

  test('shows empty state only when picker is open and no babies exist', () => {
    expect(shouldShowBabyEmptyState(true, [])).toBe(true)
    expect(shouldShowBabyEmptyState(false, [])).toBe(false)
    expect(shouldShowBabyEmptyState(true, [{ id: 1 }])).toBe(false)
  })

  test('keeps only display fields after normalizing baby list', () => {
    expect(normalizeBabyList([
      { id: 3, realName: '小北', nickName: '北北', schoolName: '实验小学', specialNote: '注意力训练' }
    ])).toEqual([
      { id: 3, realName: '小北', displayName: '小北（北北）', meta: '' }
    ])
  })
})
