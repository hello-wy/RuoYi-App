import { describe, expect, test } from 'vitest'
import { buildApplyFormStateFromTutor, buildApplyPageMode } from './apply.mode'

describe('apply.mode', () => {
  test('builds edit mode only when query mode is edit', () => {
    expect(buildApplyPageMode({ mode: 'edit' })).toBe('edit')
    expect(buildApplyPageMode({ mode: 'create' })).toBe('create')
    expect(buildApplyPageMode()).toBe('create')
  })

  test('hydrates current grade for university tutors', () => {
    const state = buildApplyFormStateFromTutor({
      identity: 0,
      currentGrade: '大三',
      subjects: 'math,english',
      areas: '320115,320116'
    })

    expect(state.form.identity).toBe(0)
    expect(state.form.currentGrade).toBe('大三')
    expect(state.form.subjects).toEqual(['math', 'english'])
    expect(state.selectedAreaCodes).toEqual(['320115', '320116'])
  })

  test('defaults current grade to empty when missing', () => {
    const state = buildApplyFormStateFromTutor({ identity: 1 })

    expect(state.form.currentGrade).toBe('')
  })
})
