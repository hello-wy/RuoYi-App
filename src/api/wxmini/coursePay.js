import request from '@/utils/request'

function normalizePayParam(payParam = {}) {
  const source = payParam || {}
  return {
    ...source,
    packageValue: source.packageValue || source.package || ''
  }
}

function unwrapData(res = {}) {
  return res.data || res
}

function unwrapRows(res = {}) {
  const data = unwrapData(res)
  if (Array.isArray(data)) return data
  if (Array.isArray(data.rows)) return data.rows
  if (Array.isArray(res.rows)) return res.rows
  return []
}

function normalizeCourseOrder(item = {}) {
  const source = item || {}
  return {
    ...source,
    id: source.id ?? source.orderId ?? source.orderNo ?? '',
    orderNo: source.orderNo || source.outTradeNo || '',
    courseId: source.courseId ?? source.lectureId ?? '',
    courseName: source.courseName || source.name || source.title || '',
    courseTime: source.courseTime || source.time || source.lectureTime || '',
    courseEndDate: source.courseEndDate || source.endDate || '',
    courseLocation: source.courseLocation || source.location || source.lectureLocation || '',
    courseCover: source.courseCover || source.coverUrl || source.lectureCover || '',
    courseCoverId: source.courseCoverId ?? source.coverId ?? '',
    amount: source.amount ?? source.registrationFee ?? source.registration_fee ?? 0,
    status: Number(source.status),
    payParam: normalizePayParam(source.payParam || source.paymentParam || {})
  }
}

function normalizeCreateResponse(res = {}) {
  const data = unwrapData(res)
  return {
    ...data,
    order: normalizeCourseOrder(data.order || data),
    orderNo: data.orderNo || data.order?.orderNo || '',
    payParam: normalizePayParam(data.payParam || data.paymentParam || data.order?.payParam || {})
  }
}

export function createCoursePayOrder(data) {
  return request({
    url: '/wxmini/pay/courses/orders/create',
    method: 'post',
    data
  }).then(normalizeCreateResponse)
}

export function queryCoursePayOrder(orderNo) {
  return request({
    url: `/wxmini/pay/courses/orders/${orderNo}`,
    method: 'get'
  }).then(res => normalizeCourseOrder(unwrapData(res)))
}

export function cancelCoursePayOrder(orderNo) {
  return request({
    url: `/wxmini/pay/courses/orders/${orderNo}/cancel`,
    method: 'post'
  }).then(res => normalizeCourseOrder(unwrapData(res)))
}

export function listMyCourseOrders() {
  return request({
    url: '/wxmini/pay/courses/orders/my',
    method: 'get'
  }).then(res => unwrapRows(res).map(normalizeCourseOrder))
}

export function getPaidCourseOrder(courseId) {
  return request({
    url: '/wxmini/pay/courses/orders/paid',
    method: 'get',
    params: { courseId }
  }).then(res => normalizeCourseOrder(unwrapData(res)))
}

export async function hasPaidCourseOrder(courseId) {
  const order = await getPaidCourseOrder(courseId)
  return Number(order.status) === 1 || Number(order.status) === 2
}

export function scanCourseSignIn(courseId, userId) {
  return request({
    url: `/system/course-attendance/courses/${courseId}/scan-sign-in`,
    method: 'post',
    data: { userId }
  }).then(unwrapData)
}
