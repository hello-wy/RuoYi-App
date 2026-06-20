import { describe, expect, test } from 'vitest'
import {
  filterGuideRoles,
  resolveGuideRoleState,
  resolveGuideSelectedRole,
} from './guide-user-type.helpers'

const ALL_ROLES = [
  { value: 0, name: '家长' },
  { value: 1, name: '学生' },
  { value: 2, name: '商家' },
  { value: 3, name: '兼职' },
]

describe('guide user type helpers', () => {
  test('keeps merchant role visible even when switchable types exclude merchant', () => {
    expect(filterGuideRoles(ALL_ROLES, [0, 1, 3])).toEqual([
      { value: 0, name: '家长' },
      { value: 1, name: '学生' },
      { value: 2, name: '商家' },
      { value: 3, name: '兼职' },
    ])
  })

  test('keeps merchant role when switchable types include merchant', () => {
    expect(filterGuideRoles(ALL_ROLES, [0, 1, 2, 3])).toEqual(ALL_ROLES)
  })

  test('falls back to all roles when switchable types are missing', () => {
    expect(filterGuideRoles(ALL_ROLES)).toEqual(ALL_ROLES)
  })

  test('keeps selected role when it is still allowed', () => {
    expect(resolveGuideSelectedRole(2, ALL_ROLES)).toBe(2)
  })

  test('keeps selected merchant role visible when whitelist is unavailable', () => {
    const filteredRoles = filterGuideRoles(ALL_ROLES, [0, 1, 3])
    expect(resolveGuideSelectedRole(2, filteredRoles)).toBe(2)
  })

  test('resolves all roles and selected role from profile switchable types', () => {
    expect(resolveGuideRoleState(ALL_ROLES, 2, { switchableUserTypes: [0, 1, 3] })).toEqual({
      roles: ALL_ROLES,
      selectedRole: 2,
    })
  })

  test('keeps all roles when profile payload is empty', () => {
    expect(resolveGuideRoleState(ALL_ROLES, 1, {})).toEqual({
      roles: ALL_ROLES,
      selectedRole: 1,
    })
  })
})
