import request from '@/utils/request'

function unwrap(response) {
  return response?.data ?? response
}

function normalizePersonalityResultResponse(result) {
  if (!result || typeof result !== 'object') return result

  const reports = resolveReportItems(result)
  return reports ? { ...result, reports } : result
}

function normalizeAttemptQuestionsResponse(result) {
  const questions = Array.isArray(result)
    ? result
    : [result?.questions, result?.list, result?.rows].find(Array.isArray) || []
  return questions.map(normalizeAttemptQuestion)
}

function normalizeAttemptQuestion(question) {
  if (!question || typeof question !== 'object') return question
  const options = Array.isArray(question.options) ? question.options : []
  const answerValue = resolveQuestionAnswerValue(question, options)
  return answerValue === undefined ? { ...question, options } : { ...question, options, answerValue }
}

function resolveQuestionAnswerValue(question, options) {
  const directValue = [question.answerValue, question.selectedValue].find(value => value !== undefined && value !== null)
  if (directValue !== undefined) return normalizeOptionValue(directValue, options)

  const selectedOptionId = question.selectedOptionId ?? question.answerOptionId
  if (selectedOptionId === undefined || selectedOptionId === null) return undefined
  const selectedOption = options.find(option => String(option.optionId ?? option.id) === String(selectedOptionId))
  return selectedOption ? selectedOption.value : undefined
}

function normalizeOptionValue(value, options) {
  const option = options.find(item => String(item.value) === String(value))
  return option ? option.value : value
}

function resolveReportItems(result) {
  const reportArrays = [result.reports, result.interpretations, result.reportItems, result.items]
  const arrayValue = reportArrays.find(Array.isArray)
  if (arrayValue) return arrayValue

  const reportValue = [result.report, result.interpretation, result.reportItem].find(item => item && typeof item === 'object')
  return reportValue ? [reportValue] : null
}

export function getPersonalityEntry() {
  return request({
    url: '/wxmini/personality-test/entry',
    method: 'get'
  }).then(unwrap)
}

export function startPersonalityAttempt(data = { mode: 'continue_or_create' }) {
  return request({
    url: '/wxmini/personality-test/attempts',
    method: 'post',
    data
  }).then(unwrap)
}

export function getCurrentQuestion(attemptId) {
  return request({
    url: `/wxmini/personality-test/attempts/${attemptId}/current-question`,
    method: 'get'
  }).then(unwrap)
}

export function getPersonalityQuestion(attemptId, questionNo) {
  return request({
    url: `/wxmini/personality-test/attempts/${attemptId}/questions/${questionNo}`,
    method: 'get'
  }).then(unwrap)
}

export function getAttemptQuestions(attemptId) {
  return request({
    url: `/wxmini/personality-test/attempts/${attemptId}/questions`,
    method: 'get'
  }).then(unwrap).then(normalizeAttemptQuestionsResponse)
}

export function savePersonalityAnswer(attemptId, data) {
  return request({
    url: `/wxmini/personality-test/attempts/${attemptId}/answers`,
    method: 'post',
    data
  }).then(unwrap)
}

export function batchSavePersonalityAnswers(attemptId, answers) {
  return request({
    url: `/wxmini/personality-test/attempts/${attemptId}/answers/batch`,
    method: 'post',
    data: { answers }
  }).then(unwrap)
}

export function getPersonalityResult(attemptId) {
  return request({
    url: `/wxmini/personality-test/attempts/${attemptId}/result`,
    method: 'get'
  }).then(unwrap).then(normalizePersonalityResultResponse)
}

export function getPersonalityAttemptCount() {
  return request({
    url: '/system/personality-test/count',
    adminAuth: true,
    method: 'get'
  }).then(unwrap)
}

export function listPersonalityAttempts(params) {
  return request({
    url: '/system/personality-test/list',
    adminAuth: true,
    method: 'get',
    params
  }).then(unwrap)
}

export function getPersonalityAttemptDetail(attemptId) {
  return request({
    url: `/system/personality-test/${attemptId}`,
    adminAuth: true,
    method: 'get'
  }).then(unwrap)
}
