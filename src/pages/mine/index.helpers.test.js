import { describe, expect, test } from 'vitest'
import { EMPTY_USER_TYPE, USER_TYPES } from '@/utils/userType'
import { filterMineMenuItems } from './index.helpers'

function createMenuItems() {
  return [
    { key: 'schedule', visible: false },
    { key: 'group', visible: false },
    { key: 'baby' },
    { key: 'coursePackage' },
    { key: 'setting' }
  ]
}

describe('mine menu helpers', () => {
  test('keeps schedule visible without checking selected identity', () => {
    const userTypes = [
      EMPTY_USER_TYPE,
      USER_TYPES.PARENT,
      USER_TYPES.STUDENT,
      USER_TYPES.MERCHANT,
      USER_TYPES.AUNT
    ]

    for (const userType of userTypes) {
      const keys = filterMineMenuItems(createMenuItems(), userType).map(item => item.key)
      expect(keys).toContain('schedule')
    }
  })

  test('keeps unrelated menu visibility rules intact', () => {
    const parentKeys = filterMineMenuItems(createMenuItems(), USER_TYPES.PARENT).map(item => item.key)
    const studentKeys = filterMineMenuItems(createMenuItems(), USER_TYPES.STUDENT).map(item => item.key)

    expect(parentKeys).toEqual(['schedule', 'baby', 'coursePackage', 'setting'])
    expect(studentKeys).toEqual(['schedule', 'setting'])
  })
})
