import { describe, expect, test } from 'vitest'
import { buildProfileFields, getStudentDisplayName, getStudentRealName } from './helpers'

describe('student helpers', () => {
  test('prefers real name over username for list display', () => {
    expect(getStudentDisplayName({ realName: '张三', userName: 'student001' })).toBe('张三')
  })

  test('falls back to username when real name is empty', () => {
    expect(getStudentDisplayName({ realName: '', userName: 'student001' })).toBe('student001')
  })

  test('supports lowercase backend field aliases', () => {
    expect(getStudentDisplayName({ realname: '李四', username: 'student002' })).toBe('李四')
    expect(getStudentRealName({ realname: '李四' })).toBe('李四')
  })

  test('includes birthday in student profile fields', () => {
    const fields = buildProfileFields({ birthday: '1992-08-18' })

    expect(fields).toContainEqual({ key: 'birthday', label: '生日', value: '1992-08-18' })
  })
})
