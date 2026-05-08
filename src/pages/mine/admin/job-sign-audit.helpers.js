export function getJobSignAuditMaterialUrls(item = {}) {
  const source = item.materialUrls || item.materialUrl || item.signMaterialUrls || item.signMaterialUrl || ''
  const urls = Array.isArray(source) ? source : String(source).split(',')
  return urls.map(url => String(url).trim()).filter(Boolean)
}

export function canAuditJobSignRecord(item = {}) {
  const submitted = item.submitted === true || getJobSignAuditMaterialUrls(item).length > 0
  return submitted && Number(item.auditStatus || 0) === 0
}

export function buildJobSignAuditStatus(item = {}) {
  const submitted = item.submitted === true || getJobSignAuditMaterialUrls(item).length > 0
  if (!submitted) {
    return { label: '未提交', type: 'empty' }
  }

  const status = Number(item.auditStatus || 0)
  if (status === 1) {
    return { label: '已通过', type: 'approved' }
  }
  if (status === 2) {
    return { label: '已拒绝', type: 'rejected' }
  }
  return { label: '待审核', type: 'pending' }
}

export function canRefundJobOrder(item = {}) {
  const auditStatus = item.signAuditStatus ?? item.auditStatus
  return Number(item.status) === 1 && Number(auditStatus) === 1
}

export function buildJobSignAuditActionLabel(auditStatus) {
  return Number(auditStatus) === 1 ? '通过' : '拒绝'
}
