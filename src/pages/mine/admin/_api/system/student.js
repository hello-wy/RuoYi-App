import request from '@/utils/request'
import { getAdminLevelLabel } from '@/pages/mine/admin/_api/system/user'

const COURSE_ORDER_STATUS_PAID_WAIT_SIGN = 1

function toBoolean(value) {
  if (typeof value === 'boolean') return value
  if (value === 1 || value === '1') return true
  if (value === 0 || value === '0') return false
  return Boolean(value)
}

function normalizeStudentRow(row = {}) {
  const boundUserName = row.boundUserNickName || row.boundUserName || ''
  const boundUserPhone = row.boundUserPhone || ''
  const studentId = row.id ?? row.studentId ?? row.userInfoId ?? row.assignmentId
  return {
    ...row,
    id: studentId,
    studentId,
    assignmentId: row.assignmentId ?? '',
    bound: toBoolean(row.bound),
    canBind: toBoolean(row.canBind),
    canClaim: toBoolean(row.canClaim),
    ownerDeptName: row.ownerDeptName || '',
    boundUserName,
    boundUserPhone,
    boundUserAdminLevelLabel: row.boundUserAdminLevel
      ? getAdminLevelLabel(row.boundUserAdminLevel)
      : '',
    boundUserDisplayName: boundUserName || boundUserPhone || ''
  }
}

function normalizeStaffCandidate(row = {}) {
  const sysUserId = row.sysUserId ?? row.userId ?? row.id
  const phone = row.boundUserPhone || row.phonenumber || row.phone || row.userName || ''
  const nickName = row.boundUserNickName || row.nickName || row.userName || ''
  return {
    ...row,
    sysUserId,
    phone,
    nickName,
    displayName: nickName || phone || '未命名员工',
    adminLevelLabel: row.adminLevel ? getAdminLevelLabel(row.adminLevel) : '员工',
    deptName: row.deptName || row.dept?.deptName || row.boundDeptName || ''
  }
}

export async function listStudents(params) {
  const res = await request({
    url: '/system/student/list',
    adminAuth: true,
    method: 'get',
    params
  })
  return {
    ...res,
    rows: Array.isArray(res?.rows) ? res.rows.map(normalizeStudentRow) : []
  }
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

function isPendingCourseEnrollment(record) {
  return record.status === COURSE_ORDER_STATUS_PAID_WAIT_SIGN
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
      enrollmentRecords: unwrapRows(data.enrollmentRecords)
        .map(normalizeCourseRecord)
        .filter(isPendingCourseEnrollment),
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

export async function searchStudentStaffCandidates(params = {}) {
  const res = await request({
    url: '/system/student/staff-candidates',
    adminAuth: true,
    method: 'get',
    params: {
      adminLevel: 'employee',
      ...params
    }
  })
  return {
    ...res,
    rows: Array.isArray(res?.rows) ? res.rows.map(normalizeStaffCandidate) : [],
    total: Number(res?.total || 0)
  }
}

export function bindStudentStaff(studentId, sysUserId) {
  const data = sysUserId ? { sysUserId } : {}
  return request({
    url: `/system/student/${studentId}/binding`,
    adminAuth: true,
    method: 'post',
    data
  })
}

export function listStudentFollowUpRecords(id) {
  return request({
    url: `/system/student/${id}/follow-up-records`,
    adminAuth: true,
    method: 'get'
  }).then((res) => unwrapRows(unwrapData(res)))
}

export function addStudentFollowUpRecord(id, data) {
  return request({
    url: `/system/student/${id}/follow-up-records`,
    adminAuth: true,
    method: 'post',
    data
  })
}

function normalizeSalonPurchaseRecord(item = {}) {
  return {
    ...item,
    id: item.id ?? item.orderNo ?? '',
    orderNo: item.orderNo || '',
    salonTitle: item.salonTitle || '未命名沙龙',
    amount: item.amount ?? 0,
    status: item.status || '',
    payTime: item.payTime || '',
    refundTime: item.refundTime || ''
  }
}

export function getStudentSalonPurchaseRecords(id) {
  return request({
    url: `/system/student/${id}/salon-purchase-records`,
    adminAuth: true,
    method: 'get'
  }).then((res) => unwrapRows(unwrapData(res)).map(normalizeSalonPurchaseRecord))
}
