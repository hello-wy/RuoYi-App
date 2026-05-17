const SUBMITTED_AUDIT_STATUS = {
  0: { label: '待审核', type: 'pending' },
  1: { label: '已通过', type: 'approved' },
  2: { label: '已驳回', type: 'rejected' }
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

export function buildAttendanceStatus(item = {}) {
  const imageUrl = getAttendanceImageUrl(item)
  const auditStatus = Number(item.auditStatus)
  if (imageUrl && Number.isFinite(auditStatus)) {
    return SUBMITTED_AUDIT_STATUS[auditStatus] || SUBMITTED_AUDIT_STATUS[0]
  }

  const explicitLabel = normalizeText(item.attendanceStatusLabel)
  if (explicitLabel) {
    const type = Number(item.attendanceStatus) === 1 ? 'approved' : 'empty'
    return { label: explicitLabel, type }
  }

  if (!imageUrl) {
    return { label: '未提交', type: 'empty' }
  }

  return SUBMITTED_AUDIT_STATUS[0]
}

export function canUploadAttendanceImage(item = {}) {
  const status = buildAttendanceStatus(item)
  return status.type === 'empty' || status.type === 'rejected'
}

export function getAttendanceRejectReason(item = {}) {
  if (Number(item.auditStatus) !== 2 && buildAttendanceStatus(item).type !== 'rejected') {
    return ''
  }
  return firstNonEmpty([item.auditRemark, item.rejectReason, item.rejectionReason, item.auditRejectReason])
}
