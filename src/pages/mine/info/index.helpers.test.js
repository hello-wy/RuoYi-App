import { describe, expect, test } from 'vitest'
import { buildInfoSubmitPayload, normalizeInfoForm } from './index.helpers'

describe('个人资料生日字段', () => {
  test('加载资料时保留生日', () => {
    const form = normalizeInfoForm({
      userType: 0,
      birthday: '1992-08-18'
    })

    expect(form.birthday).toBe('1992-08-18')
  })

  test('保存资料时提交生日', () => {
    const payload = buildInfoSubmitPayload({
      ...normalizeInfoForm({ userType: 0 }),
      birthday: '1992-08-18'
    })

    expect(payload.birthday).toBe('1992-08-18')
  })
})
