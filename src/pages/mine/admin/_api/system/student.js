import request from '@/utils/request'

export function listStudents(params) {
  return request({
    url: '/system/student/list',
    adminAuth: true,
    method: 'get',
    params
  })
}

export function getStudentDetail(id) {
  return request({
    url: '/system/student/' + id,
    adminAuth: true,
    method: 'get'
  })
}

function unwrapData(res = {}) {
  return res.data || res
}

function unwrapRows(value) {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.rows)) return value.rows
  return []
}

function normalizeCourseRecord(item = {}) {
  const source = item || {}
  return {
    ...source,
    id: source.id ?? source.orderId ?? source.orderNo ?? '',
    orderId: source.orderId ?? source.id ?? '',
    orderNo: source.orderNo || '',
    courseId: source.courseId ?? '',
    courseName: source.courseName || source.name || source.title || '未命名课程',
    courseLocation: source.courseLocation || source.location || '',
    courseTime: source.courseTime || source.time || '',
    amount: source.amount ?? 0,
    status: Number(source.status),
    recordType: source.recordType === undefined ? undefined : Number(source.recordType),
    signStatus: source.signStatus === undefined ? undefined : Number(source.signStatus),
    payTime: source.payTime || '',
    signTime: source.signTime || '',
    refundTime: source.refundTime || '',
    createTime: source.createTime || ''
  }
}

export function getStudentLearningRecords(id) {
  return request({
    url: `/system/student/${id}/learning-records`,
    adminAuth: true,
    method: 'get'
  }).then((res) => {
    const data = unwrapData(res)
    return {
      enrollmentRecords: unwrapRows(data.enrollmentRecords).map(normalizeCourseRecord),
      signInRecords: unwrapRows(data.signInRecords).map(normalizeCourseRecord)
    }
  })
}

export function getStudentEnrollments(id) {
  return request({
    url: `/system/student/${id}/enrollments`,
    adminAuth: true,
    method: 'get'
  }).then((res) => unwrapData(res))
}

export function shareStudentEnrollment(data) {
  return request({
    url: '/system/enrollment/share',
    adminAuth: true,
    method: 'post',
    data
  })
}

export function updateStudentSituation(id, data) {
  return request({
    url: '/system/student/' + id + '/situation',
    adminAuth: true,
    method: 'put',
    data
  })
}
