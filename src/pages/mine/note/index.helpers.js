export const MAX_COURSE_NOTE_LENGTH = 2000

const NOTEABLE_ORDER_STATUSES = new Set([1, 2])

export function extractNoteCourses(orders = []) {
  const courses = new Map()

  orders.forEach(order => {
    const courseId = order?.courseId ?? order?.lectureId
    if (!courseId || !NOTEABLE_ORDER_STATUSES.has(Number(order?.status))) return
    if (courses.has(String(courseId))) return

    courses.set(String(courseId), {
      id: courseId,
      name: order.courseName || order.lectureName || '未命名课程'
    })
  })

  return [...courses.values()]
}

export function isCourseNoteContentValid(content) {
  const value = String(content || '').trim()
  return value.length > 0 && value.length <= MAX_COURSE_NOTE_LENGTH
}
