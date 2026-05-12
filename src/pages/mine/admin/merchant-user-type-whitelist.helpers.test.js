import { describe, expect, test } from 'vitest'
import {
  buildMerchantUserTypeWhitelistPayload,
  validateMerchantUserTypeWhitelistForm,
} from './merchant-user-type-whitelist.helpers'

describe('merchant user type whitelist helpers', () => {
  test('normalizes form values for submit payload', () => {
    expect(buildMerchantUserTypeWhitelistPayload({
      realName: ' 张三 ',
      idCard: ' 11010519900101123x ',
      remark: ' 备注 '
    })).toEqual({
      realName: '张三',
      idCard: '11010519900101123X',
      remark: '备注'
    })
  })

  test('rejects empty real name before submit', () => {
    expect(validateMerchantUserTypeWhitelistForm({
      realName: ' ',
      idCard: '11010519900101123X'
    })).toEqual({ valid: false, message: '请填写真实姓名' })
  })

  test('rejects invalid id card before submit', () => {
    expect(validateMerchantUserTypeWhitelistForm({
      realName: '张三',
      idCard: '123'
    })).toEqual({ valid: false, message: '请填写正确的18位身份证号' })
  })

  test('accepts valid form before submit', () => {
    expect(validateMerchantUserTypeWhitelistForm({
      realName: '张三',
      idCard: '11010519900101123X'
    })).toEqual({ valid: true, message: '' })
  })
})
