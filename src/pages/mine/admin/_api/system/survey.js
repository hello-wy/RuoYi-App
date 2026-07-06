import request from '@/utils/request'

function unwrapData(res) {
  return res?.data ?? res
}

function normalizeOption(option = {}) {
  return {
    ...option,
    value: option.value ?? option.optionValue,
    label: option.label || option.optionLabel || option.content || option.text || ''
  }
}

function normalizeQuestion(question = {}) {
  return {
    ...question,
    questionId: question.questionId ?? question.id,
    questionNo: question.questionNo ?? question.sortOrder ?? '',
    questionType: question.questionType || question.type || '',
    content: question.content || question.title || question.questionText || question.questionContent || '',
    options: (question.options || []).map(normalizeOption),
    children: (question.children || []).map(normalizeQuestion)
  }
}

function normalizeSurveyDetail(res) {
  const data = unwrapData(res) || {}
  return {
    ...data,
    questions: (data.questions || []).map(normalizeQuestion)
  }
}

function normalizeLecture(row = {}) {
  return {
    ...row,
    id: row.id ?? row.lectureId ?? row.courseId,
    name: row.name || row.title || row.courseName || row.lectureName || '未命名课程'
  }
}

export function listSurvey(params) {
  return request({
    url: '/system/survey/list',
    method: 'get',
    adminAuth: true,
    params
  })
}

export function getSurvey(formId) {
  return request({
    url: '/system/survey/' + formId,
    method: 'get',
    adminAuth: true
  }).then(normalizeSurveyDetail)
}

export function searchSurveyUsers(params) {
  return request({
    url: '/system/survey/wx-users',
    method: 'get',
    adminAuth: true,
    params
  })
}

export function distributeSurvey(formId, data) {
  return request({
    url: '/system/survey/' + formId + '/distribute',
    method: 'post',
    adminAuth: true,
    data
  })
}

export function listSurveyAssignments(formId, params) {
  return request({
    url: '/system/survey/' + formId + '/assignments',
    method: 'get',
    adminAuth: true,
    params
  })
}

export function getSurveyAssignmentDetail(assignmentId) {
  return request({
    url: '/system/survey/assignments/' + assignmentId,
    method: 'get',
    adminAuth: true
  }).then(unwrapData)
}

export function listSurveyLectures(params) {
  return request({
    url: '/system/lectures/list',
    method: 'get',
    adminAuth: true,
    params
  }).then(res => ({
    ...res,
    rows: Array.isArray(res?.rows) ? res.rows.map(normalizeLecture) : []
  }))
}
