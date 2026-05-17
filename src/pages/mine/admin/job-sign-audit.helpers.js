export function getJobSignAuditMaterialUrls(item = {}) {
  const source = item.signImageUrl || item.materialUrls || item.materialUrl || item.signMaterialUrls || item.signMaterialUrl || ''
  const urls = Array.isArray(source) ? source : String(source).split(',')
  return urls.map(url => String(url).trim()).filter(Boolean)
}

export function canAuditJobSignRecord(item = {}) {
  const submitted = Boolean(item.submitted) || getJobSignAuditMaterialUrls(item).length > 0
  return submitted && Number(item.auditStatus || 0) === 1
}

export function buildJobSignAuditStatus(item = {}) {
  const submitted = Boolean(item.submitted) || getJobSignAuditMaterialUrls(item).length > 0
  if (!submitted) {
    return { label: '未提交', type: 'empty' }
  }

  const status = Number(item.auditStatus || 0)
  if (status === 2) {
    return { label: '已通过', type: 'approved' }
  }
  if (status === 3) {
    return { label: '已驳回', type: 'rejected' }
  }
  return { label: '待审核', type: 'pending' }
}

export function canRefundJobOrder(item = {}) {
  return Boolean(item.canRefund)
}

export function buildJobSignAuditActionLabel(auditStatus) {
  return Number(auditStatus) === 2 ? '通过' : '驳回'
}
