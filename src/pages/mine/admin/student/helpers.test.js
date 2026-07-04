import { describe, expect, test } from 'vitest'
import { getStudentDisplayName, getStudentRealName } from './helpers'

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
})
