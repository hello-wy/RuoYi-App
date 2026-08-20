import { describe, expect, test } from 'vitest'
import {
  buildLecturePayload,
  createLectureForm,
  sortLecturesByTop,
} from './helpers'

describe('lecture helpers', () => {
  test('builds the standard lecture payload', () => {
    const payload = buildLecturePayload({
      ...createLectureForm(),
      id: 8,
      name: '幸福解码',
      startDate: '2026-08-20',
      startTime: '09:00',
      endDate: '2026-08-20',
      endTime: '17:00',
      location: '南京市示例地址',
    })

    expect(payload).toMatchObject({ id: 8, name: '幸福解码', requiresEnrollment: true })
  })

  test('sorts pinned lectures first without mutating the original list', () => {
    const lectures = [
      { id: 1, isTop: false, time: '2026-08-21 09:00' },
      { id: 2, isTop: true, time: '2026-08-22 09:00' },
      { id: 3, isTop: true, time: '2026-08-20 09:00' },
    ]

    expect(sortLecturesByTop(lectures).map(item => item.id)).toEqual([3, 2, 1])
    expect(lectures.map(item => item.id)).toEqual([1, 2, 3])
  })
})
