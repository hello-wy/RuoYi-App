import { afterEach, describe, expect, test, vi } from 'vitest'
import {
  appendInviteCodeToPath,
  appendInviteCodeToQuery,
  cacheShareInviteCode,
  clearShareInviteCode,
  getCachedShareInviteCode
} from './invite-share'

const storage = new Map()

globalThis.uni = {
  getStorageSync: vi.fn(key => storage.get(key)),
  removeStorageSync: vi.fn(key => storage.delete(key)),
  setStorageSync: vi.fn((key, value) => storage.set(key, value))
}

afterEach(() => {
  storage.clear()
  vi.clearAllMocks()
})

describe('invite share helpers', () => {
  test('adds an encoded invite code to a page path', () => {
    expect(appendInviteCodeToPath('/pages/growup/detail?id=42', 'A B')).toBe(
      '/pages/growup/detail?id=42&inviteCode=A%20B'
    )
  })

  test('replaces an existing invite code without duplicating the parameter', () => {
    expect(appendInviteCodeToQuery('id=42&inviteCode=old', 'new')).toBe(
      'id=42&inviteCode=new'
    )
  })

  test('uses the cached inviter code for default share content', () => {
    cacheShareInviteCode('REF-001')

    expect(getCachedShareInviteCode()).toBe('REF-001')
    expect(appendInviteCodeToPath('/pages/index')).toBe('/pages/index?inviteCode=REF-001')
  })

  test('clears the cached code on logout', () => {
    cacheShareInviteCode('REF-001')
    clearShareInviteCode()

    expect(getCachedShareInviteCode()).toBe('')
  })
})
