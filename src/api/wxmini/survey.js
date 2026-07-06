import request from '@/utils/request'

function unwrap(response) {
  return response?.data ?? response
}

function normalizeAssignment(item = {}) {
  const status = Number(item.status ?? item.assignmentStatus ?? 0)
  return {
    ...item,
    assignmentId: item.assignmentId ?? item.id,
    formId: item.formId,
    title: item.title || item.formTitle || item.name || '问卷调查',
    code: item.code || item.formCode || '',
    status,
    submitted: status === 1,
    assignedAt: item.assignedAt || item.createTime || '',
    submittedAt: item.submittedAt || ''
  }
}

function normalizeCourseGroup(group = {}) {
  return {
    ...group,
    courseId: group.courseId ?? group.lectureId,
    courseName: group.courseName || group.lectureName || '未命名课程',
    assignments: (group.assignments || group.surveys || []).map(normalizeAssignment)
  }
}

export function listSurveyAssignments() {
  return request({
    url: '/wxmini/surveys/assignments',
    method: 'get'
  }).then(res => (unwrap(res) || []).map(normalizeCourseGroup))
}

export function getSurveyAssignment(assignmentId) {
  return request({
    url: `/wxmini/surveys/assignments/${assignmentId}`,
    method: 'get'
  }).then(unwrap)
}

export function submitSurveyAssignment(assignmentId, data) {
  return request({
    url: `/wxmini/surveys/assignments/${assignmentId}/submit`,
    method: 'post',
    data
  }).then(unwrap)
}
