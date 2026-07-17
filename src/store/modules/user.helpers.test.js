import { describe, expect, test } from 'vitest'
import { createAdminSessionSnapshot } from './user.helpers'

describe('user store helpers', () => {
  test('creates admin session snapshot from logged-in admin account', () => {
    expect(createAdminSessionSnapshot('admin-token', ['admin'])).toEqual({
      token: 'admin-token',
      roles: ['admin']
    })
  })

  test('creates admin session snapshot for national general managers', () => {
    expect(createAdminSessionSnapshot('manager-token', ['national_general_manager'])).toEqual({
      token: 'manager-token',
      roles: ['national_general_manager']
    })
  })

  test('does not create admin session snapshot for regular accounts', () => {
    expect(createAdminSessionSnapshot('user-token', ['ROLE_DEFAULT'])).toBeNull()
    expect(createAdminSessionSnapshot('', ['admin'])).toBeNull()
  })
})
