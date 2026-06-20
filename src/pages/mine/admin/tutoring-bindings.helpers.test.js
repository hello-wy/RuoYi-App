import { describe, expect, test } from 'vitest'

import {
  formatBoundTutorName,
  formatBoundStudentPhone
} from './tutoring-bindings.helpers'

describe('tutoring bindings helpers', () => {
  test('shows the bound tutor real name only for bound items', () => {
    expect(formatBoundTutorName({ bound: true, tutorName: '张三' })).toBe('张三')
    expect(formatBoundTutorName({ bound: false, tutorName: '张三' })).toBe('')
  })

  test('shows the bound tutor phone only for bound items', () => {
    expect(formatBoundStudentPhone({ bound: true, studentPhone: '13800000000' })).toBe('13800000000')
    expect(formatBoundStudentPhone({ bound: false, studentPhone: '13800000000' })).toBe('')
  })
})
