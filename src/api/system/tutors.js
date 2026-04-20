import request from '@/utils/request'

const DEFAULT_PENDING_TUTOR_REVIEW_QUERY = {
  isCertified: 0,
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

// 查询大学生/教员列表
export function listTutors(query) {
  return request({
    url: '/system/tutors/list',
    method: 'get',
    params: query
  })
}

// 查询大学生/教员详细
export function getTutors(id) {
  return request({
    url: '/system/tutors/' + id,
    method: 'get'
  })
}

// 新增大学生/教员
export function addTutors(data) {
  return request({
    url: '/system/tutors',
    method: 'post',
    data: data
  })
}

// 修改大学生/教员
export function updateTutors(data) {
  return request({
    url: '/system/tutors',
    method: 'put',
    data: data
  })
}

// 审核大学生/教员认证状态
export function reviewTutors(data) {
  return request({
    url: '/system/tutors/review',
    method: 'put',
    data: data
  })
}

// 删除大学生/教员
export function delTutors(id) {
  return request({
    url: '/system/tutors/' + id,
    method: 'delete'
  })
}
