import request from '@/utils/request'

const DEFAULT_PENDING_TUTOR_REVIEW_QUERY = {
  status: 0,
  pageNum: 1,
  pageSize: 10,
  orderByColumn: 'createDate',
  isAsc: 'desc'
}

export function buildPendingTutorReviewQuery(query = {}) {
  return {
    ...DEFAULT_PENDING_TUTOR_REVIEW_QUERY,
    ...query
  }
}

export async function getPendingTutorReviewCount() {
  const res = await listTutors(buildPendingTutorReviewQuery({ pageSize: 1 }))
  return Number(res.total || 0)
}

export function listTutors(query) {
  return request({
    url: '/system/tutors/list',
    method: 'get',
    params: query
  })
}

export function getTutors(id) {
  return request({
    url: '/system/tutors/' + id,
    method: 'get'
  })
}

export function addTutors(data) {
  return request({
    url: '/system/tutors',
    method: 'post',
    data: data
  })
}

export function updateTutors(data) {
  return request({
    url: '/system/tutors',
    method: 'put',
    data: data
  })
}

export function reviewTutors(data) {
  return request({
    url: '/system/tutors/review',
    method: 'put',
    data: data
  })
}

export function delTutors(id) {
  return request({
    url: '/system/tutors/' + id,
    method: 'delete'
  })
}
