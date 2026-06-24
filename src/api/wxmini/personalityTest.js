import request from '@/utils/request'

function unwrap(response) {
  return response?.data ?? response
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

export function savePersonalityAnswer(attemptId, data) {
  return request({
    url: `/wxmini/personality-test/attempts/${attemptId}/answers`,
    method: 'post',
    data
  }).then(unwrap)
}

export function getPersonalityResult(attemptId) {
  return request({
    url: `/wxmini/personality-test/attempts/${attemptId}/result`,
    method: 'get'
  }).then(unwrap)
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
