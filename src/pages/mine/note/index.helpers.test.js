import { describe, expect, it } from 'vitest'
import {
  extractNoteCourses,
  isCourseNoteContentValid,
  MAX_COURSE_NOTE_LENGTH
} from './index.helpers'

describe('课程笔记辅助函数', () => {
  it('仅保留当前用户已支付或已签到的去重课程', () => {
    const courses = extractNoteCourses([
      { courseId: 10, courseName: '课程 A', status: 1 },
      { courseId: 10, courseName: '重复课程 A', status: 2 },
      { courseId: 11, courseName: '待支付课程', status: 0 },
      { lectureId: 12, lectureName: '课程 C', status: 2 }
    ])

    expect(courses).toEqual([
      { id: 10, name: '课程 A' },
      { id: 12, name: '课程 C' }
    ])
  })

  it('校验去首尾空白后的纯文本笔记长度', () => {
    expect(isCourseNoteContentValid('  有效笔记  ')).toBe(true)
    expect(isCourseNoteContentValid('   ')).toBe(false)
    expect(isCourseNoteContentValid('a'.repeat(MAX_COURSE_NOTE_LENGTH))).toBe(true)
    expect(isCourseNoteContentValid('a'.repeat(MAX_COURSE_NOTE_LENGTH + 1))).toBe(false)
  })
})
