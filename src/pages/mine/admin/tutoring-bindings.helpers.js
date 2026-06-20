export function formatBoundTutorName(item = {}) {
  if (item.bound !== true) {
    return ''
  }
  return item.tutorName || ''
}

export function formatBoundStudentPhone(item = {}) {
  if (item.bound !== true) {
    return ''
  }
  return item.studentPhone || ''
}
