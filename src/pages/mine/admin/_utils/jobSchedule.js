const AUDIT_STATUS_MAP = {
  0: { label: '未提交', type: 'empty' },
  1: { label: '待审核', type: 'pending' },
  2: { label: '已通过', type: 'approved' },
  3: { label: '已驳回', type: 'rejected' }
}

const TUTORING_STATUS = {
  PENDING: 0,
  WAIT_PARENT_CONFIRM: 1,
  WAIT_SETTLEMENT: 2,
  SETTLED: 3
}

const USER_TYPE_PARENT = 0
const USER_TYPE_STUDENT = 1

function normalizeText(value = '') {
  return String(value || '').trim()
}

function firstNonEmpty(values = []) {
  return values.map(normalizeText).find(Boolean) || ''
}

export function getAttendanceImageUrl(item = {}) {
  const source = item.signImageUrl || item.materialUrls || item.materialUrl || item.signMaterialUrls || item.signMaterialUrl || ''
  const urls = Array.isArray(source) ? source : String(source).split(',')
  return urls.map(normalizeText).find(Boolean) || ''
}

export function buildAttendanceAuditStatus(item = {}) {
  const explicitLabel = normalizeText(item.auditStatusLabel)
  const auditStatus = Number(item.auditStatus || 0)
  const matched = AUDIT_STATUS_MAP[auditStatus] || AUDIT_STATUS_MAP[0]
  if (explicitLabel) {
    return { label: explicitLabel, type: matched.type }
  }
  return matched
}

export function buildAttendanceStatus(item = {}) {
  const explicitLabel = normalizeText(item.attendanceStatusLabel)
  if (explicitLabel && !getAttendanceImageUrl(item)) {
    const type = Number(item.attendanceStatus) === 1 ? 'approved' : 'empty'
    return { label: explicitLabel, type }
  }
  return buildAttendanceAuditStatus(item)
}

export function canUploadAttendanceImage(item = {}) {
  const auditStatus = Number(item.auditStatus || 0)
  return auditStatus === 0 || auditStatus === 3
}

export function getAttendanceRejectReason(item = {}) {
  if (Number(item.auditStatus || 0) !== 3) {
    return ''
  }
  return firstNonEmpty([item.auditRemark, item.rejectReason, item.rejectionReason, item.auditRejectReason])
}

export function canRefundJobOrder(item = {}) {
  return Boolean(item.canRefund)
}

export function buildTutoringScheduleStatus(item = {}) {
  const confirmed = hasParentConfirmation(item)
  if (Number(item.status) === TUTORING_STATUS.WAIT_PARENT_CONFIRM && confirmed) {
    return { label: '待管理员审核', type: 'pending' }
  }
  const explicitLabel = normalizeText(item.statusLabel || item.scheduleStatusLabel || item.orderStatusLabel)
  const status = Number(item.status ?? item.scheduleStatus ?? item.orderStatus ?? 0)
  const map = {
    [TUTORING_STATUS.PENDING]: { label: '待上课', type: 'pending' },
    [TUTORING_STATUS.WAIT_PARENT_CONFIRM]: { label: '正在上课', type: 'warning' },
    [TUTORING_STATUS.WAIT_SETTLEMENT]: { label: '待结算', type: 'approved' },
    [TUTORING_STATUS.SETTLED]: { label: '已结算', type: 'approved' }
  }
  const matched = map[status] || map[0]
  if (status === TUTORING_STATUS.WAIT_PARENT_CONFIRM) {
    return matched
  }
  if (explicitLabel) {
    return { label: explicitLabel, type: matched.type }
  }
  return matched
}

export function hasParentConfirmation(item = {}) {
  return Boolean(firstNonEmpty([
    item.confirmTime,
    item.parentConfirmTime,
    item.confirmedTime
  ]))
}

export function hasStudentCheckIn(item = {}) {
  return Boolean(firstNonEmpty([
    item.finishTime,
    item.studentCheckInTime,
    item.checkInTime
  ]))
}

function matchesUserType(userType, expectedType) {
  return userType === undefined || Number(userType) === expectedType
}

export function canStudentCheckInTutoringSchedule(item = {}, userType) {
  if (!matchesUserType(userType, USER_TYPE_STUDENT)) return false
  if (Number(item.status) !== TUTORING_STATUS.PENDING) return false
  if (hasStudentCheckIn(item)) return false
  if (item.canStudentComplete !== undefined) return Boolean(item.canStudentComplete)
  return true
}

export function canParentConfirmTutoringSchedule(item = {}, userType) {
  if (!matchesUserType(userType, USER_TYPE_PARENT)) return false
  if (hasParentConfirmation(item)) return false
  if (item.canParentConfirm !== undefined) return Boolean(item.canParentConfirm)
  return Number(item.status) === TUTORING_STATUS.WAIT_PARENT_CONFIRM
}
