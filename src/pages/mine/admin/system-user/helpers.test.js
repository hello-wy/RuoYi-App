import { describe, expect, test } from 'vitest'
import {
  buildEmptySystemUserForm,
  buildSystemUserPayload,
  validateSystemUserForm
} from './helpers'

describe('system user helpers', () => {
  test('initializes create form with an editable raw password', () => {
    expect(buildEmptySystemUserForm().rawPassword).toBe('')
  })

  test('builds create payload with phone as username and raw password', () => {
    expect(buildSystemUserPayload({
      phonenumber: ' 13800000000 ',
      rawPassword: ' Admin123 ',
      nickName: '张三',
      adminLevel: 'employee'
    })).toEqual({
      phonenumber: '13800000000',
      rawPassword: 'Admin123',
      userName: '13800000000',
      nickName: '张三',
      adminLevel: 'employee'
    })
  })

  test('omits empty raw password when updating a user', () => {
    expect(buildSystemUserPayload({
      userId: 1,
      phonenumber: '13800000000',
      rawPassword: '',
      nickName: '张三',
      adminLevel: 'employee'
    })).toEqual({
      userId: 1,
      phonenumber: '13800000000',
      userName: '13800000000',
      nickName: '张三',
      adminLevel: 'employee'
    })
  })

  test('requires raw password when creating a user', () => {
    expect(validateSystemUserForm({
      phonenumber: '13800000000',
      nickName: '张三',
      adminLevel: 'employee',
      rawPassword: ''
    })).toEqual({ valid: false, message: '请输入登录密码' })
  })

  test('does not require raw password when editing a user', () => {
    expect(validateSystemUserForm({
      userId: 1,
      phonenumber: '13800000000',
      nickName: '张三',
      adminLevel: 'employee',
      rawPassword: ''
    })).toEqual({ valid: true, message: '' })
  })
})
