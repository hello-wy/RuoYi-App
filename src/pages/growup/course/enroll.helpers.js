const UNSET_TIME_TEXT = '未设置'
const EMPTY_ENROLLMENT_TEXT = '暂无可用学籍'
const MISSING_ENROLLMENT_MESSAGE = '当前课程暂无可用学籍，无法报名'

function formatCourseDate(dateText) {
  const value = String(dateText || '').trim()
  if (!value) return ''
  return value.replace(/^(\d{4})-(\d{2})-(\d{2}).*/, '$1.$2.$3')
}

export function buildCourseTimeText(course = {}) {
  const start = formatCourseDate(course.time)
  if (!start) return UNSET_TIME_TEXT

  const end = formatCourseDate(course.endDate)
  return end ? `${start}-${end}` : start
}

export function courseRequiresEnrollment(course = {}) {
  const value = course.requiresEnrollment ?? course.requires_enrollment
  return value === undefined || value === null ? true : !isDisabledFlag(value)
}

export function buildCourseEnrollmentText(enrollment) {
  if (!enrollment) return EMPTY_ENROLLMENT_TEXT

  const remain = Number(enrollment.remain || 0)
  return remain > 0 ? `剩余 ${remain} 次` : EMPTY_ENROLLMENT_TEXT
}

export function canSubmitCourseEnrollment({ course = {}, enrollment = null } = {}) {
  if (!courseRequiresEnrollment(course)) {
    return { ok: true, message: '' }
  }

  const remain = Number((enrollment && enrollment.remain) || 0)
  return remain > 0
    ? { ok: true, message: '' }
    : { ok: false, message: MISSING_ENROLLMENT_MESSAGE }
}

function isDisabledFlag(value) {
  return value === false || value === 0 || value === '0' || value === 'false'
}
