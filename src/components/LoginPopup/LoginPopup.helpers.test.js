import { describe, expect, test } from 'vitest'
import { createLoginForm, resolveLoginSuccessUrl, shouldRequestPhoneCode } from './LoginPopup.helpers'

describe('LoginPopup helpers', () => {
  test('prefills account credentials in dev mode', () => {
    expect(createLoginForm({ isDev: true })).toEqual({
      username: 'admin',
      password: 'admin123',
      code: '',
      uuid: ''
    })
  })

  test('keeps account credentials empty outside dev mode', () => {
    expect(createLoginForm({ isDev: false })).toEqual({
      username: '',
      password: '',
      code: '',
      uuid: ''
    })
  })

  test('lets explicit initial login form override dev defaults', () => {
    expect(createLoginForm({
      isDev: true,
      initialLoginForm: { username: 'operator', code: '1234' }
    })).toEqual({
      username: 'operator',
      password: 'admin123',
      code: '1234',
      uuid: ''
    })
  })

  test('routes users without identity to guide after login', () => {
    expect(resolveLoginSuccessUrl({
      mode: 'realtimePhone',
      payload: { userType: '' },
      fallbackUrl: ''
    })).toBe('/pages/guide/index')
  })

  test('keeps users with identity on configured success route', () => {
    expect(resolveLoginSuccessUrl({
      mode: 'realtimePhone',
      payload: { userType: 1 },
      fallbackUrl: ''
    })).toBe('')
  })

  test('routes account login without identity to guide after profile loads', () => {
    expect(resolveLoginSuccessUrl({
      mode: 'account',
      userType: '',
      fallbackUrl: '/pages/index'
    })).toBe('/pages/guide/index')
  })

  test('keeps admin account login on configured success route without identity', () => {
    expect(resolveLoginSuccessUrl({
      mode: 'account',
      token: 'admin-token',
      roles: ['admin'],
      userType: '',
      fallbackUrl: '/pages/index'
    })).toBe('/pages/index')
  })

  test('requests phone code only after wx login asks for it and platform supports it', () => {
    expect(shouldRequestPhoneCode({
      phoneAuthorizationPending: false,
      realtimePhoneSupported: true
    })).toBe(false)
    expect(shouldRequestPhoneCode({
      phoneAuthorizationPending: true,
      realtimePhoneSupported: false
    })).toBe(false)
    expect(shouldRequestPhoneCode({
      phoneAuthorizationPending: true,
      realtimePhoneSupported: true
    })).toBe(true)
  })
})
