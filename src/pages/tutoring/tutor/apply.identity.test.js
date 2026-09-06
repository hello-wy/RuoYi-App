import { describe, expect, test } from 'vitest'
import { buildVerifiedIdentityForm } from './apply.identity'

describe('buildVerifiedIdentityForm', () => {
  test('fills the authenticated name and ID card from the current user profile', () => {
    const form = { realName: '', idCard: '', city: '江宁区' }

    expect(buildVerifiedIdentityForm(form, {
      isRealnameAuth: 1,
      realName: '张三',
      idCard: '11010519900101123X',
    })).toEqual({
      realName: '张三',
      idCard: '11010519900101123X',
      city: '江宁区',
    })
  })

  test('does not change the form for users who are not authenticated', () => {
    const form = { realName: '', idCard: '' }

    expect(buildVerifiedIdentityForm(form, {
      isRealnameAuth: 0,
      realName: '张三',
      idCard: '11010519900101123X',
    })).toBe(form)
  })
})
