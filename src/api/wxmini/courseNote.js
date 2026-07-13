import request from '@/utils/request'

function unwrapData(response = {}) {
  return response.data ?? response
}

function normalizeCourseNote(note = {}) {
  const source = note || {}
  return {
    id: source.id ?? '',
    courseId: source.courseId ?? source.lectureId ?? '',
    courseName: source.courseName || source.lectureName || '未命名课程',
    content: source.content || '',
    createTime: source.createTime || '',
    updateTime: source.updateTime || ''
  }
}

export function listMyCourseNotes() {
  return request({
    url: '/wxmini/growup/notes',
    method: 'get'
  }).then(response => {
    const data = unwrapData(response)
    return (Array.isArray(data) ? data : []).map(normalizeCourseNote)
  })
}

export function createMyCourseNote(data) {
  return request({
    url: '/wxmini/growup/notes',
    method: 'post',
    data
  }).then(response => normalizeCourseNote(unwrapData(response)))
}

export function updateMyCourseNote(noteId, data) {
  return request({
    url: `/wxmini/growup/notes/${noteId}`,
    method: 'put',
    data
  }).then(response => normalizeCourseNote(unwrapData(response)))
}

export function deleteMyCourseNote(noteId) {
  return request({
    url: `/wxmini/growup/notes/${noteId}`,
    method: 'delete'
  })
}
