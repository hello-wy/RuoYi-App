const AUDIT_STATUS_MAP = {
  0: { label: '未提交', type: 'empty' },
  1: { label: '待审核', type: 'pending' },
  2: { label: '已通过', type: 'approved' },
  3: { label: '已驳回', type: 'rejected' }
}

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
  const explicitLabel = normalizeText(item.statusLabel || item.scheduleStatusLabel || item.orderStatusLabel)
  const status = Number(item.status ?? item.scheduleStatus ?? item.orderStatus ?? 0)
  const map = {
    0: { label: '待上课', type: 'pending' },
    1: { label: '待确认', type: 'warning' },
    2: { label: '待审稿', type: 'approved' },
    3: { label: '已完成', type: 'approved' },
    4: { label: '已取消', type: 'rejected' }
  }
  const matched = map[status] || map[0]
  if (explicitLabel) {
    return { label: explicitLabel, type: matched.type }
  }
  return matched
}
