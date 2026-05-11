import { describe, expect, test } from 'vitest'
import {
  buildParttimeWhitelistPayload,
  validateParttimeWhitelistForm,
} from './parttime-whitelist.helpers'

describe('parttime whitelist helpers', () => {
  test('normalizes form values for submit payload', () => {
    expect(buildParttimeWhitelistPayload({
      realName: ' 张三 ',
      idCard: ' 11010519900101123x ',
      price: ' 88.50 ',
      remark: ' 备注 '
    })).toEqual({
      realName: '张三',
      idCard: '11010519900101123X',
      price: 88.5,
      remark: '备注'
    })
  })

  test('rejects empty real name before submit', () => {
    expect(validateParttimeWhitelistForm({
      realName: ' ',
      idCard: '11010519900101123X',
      price: '88.5'
    })).toEqual({ valid: false, message: '请填写真实姓名' })
  })

  test('rejects invalid id card before submit', () => {
    expect(validateParttimeWhitelistForm({
      realName: '张三',
      idCard: '123',
      price: '88.5'
    })).toEqual({ valid: false, message: '请填写正确的18位身份证号' })
  })

  test('rejects missing price before submit', () => {
    expect(validateParttimeWhitelistForm({
      realName: '张三',
      idCard: '11010519900101123X',
      price: ''
    })).toEqual({ valid: false, message: '请填写价格' })
  })

  test('accepts valid form before submit', () => {
    expect(validateParttimeWhitelistForm({
      realName: '张三',
      idCard: '11010519900101123X',
      price: '88.5'
    })).toEqual({ valid: true, message: '' })
  })
})
