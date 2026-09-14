import { describe, expect, test } from 'vitest'
import { buildApplyFormStateFromTutor, shouldInitializeApplyPage } from './apply.mode'

describe('buildApplyFormStateFromTutor', () => {
  test('restores material IDs and normalized material image URLs for editing', () => {
    const state = buildApplyFormStateFromTutor({
      certificates: '101,102',
      materials: [{ id: 101, type: 1, url: '/upload/front.jpg' }],
    }, 'https://api.test')

    expect(state.form.certificates).toBe('101,102')
    expect(state.form.materials).toEqual([
      {
        id: '101',
        type: 1,
        typeName: '',
        directoryName: '',
        url: 'https://api.test/upload/front.jpg',
      },
    ])
  })
})

describe('shouldInitializeApplyPage', () => {
  test('does not reload form data after image picker or preview returns to the page', () => {
    expect(shouldInitializeApplyPage({ initialized: true, initializing: false })).toBe(false)
  })

  test('prevents concurrent initialization while the first request is pending', () => {
    expect(shouldInitializeApplyPage({ initialized: false, initializing: true })).toBe(false)
  })

  test('allows the first page initialization', () => {
    expect(shouldInitializeApplyPage()).toBe(true)
  })
})
