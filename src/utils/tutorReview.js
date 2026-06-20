function mapMethodLabels(value, options = []) {
  if (value === null || value === undefined || value === '') {
    return []
  }

  return String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .map(item => {
      const found = options.find(option => String(option.value) === item)
      return found ? found.label || found.text : item
    })
}

export function buildTutorReviewDetailUrl(item = {}) {
  return `/pages/tutoring/tutor/detail?id=${item.id}&auditMode=1`
}

export function isTutorAuditMode(options = {}) {
  return String(options.auditMode) === '1'
}

export function buildTutorReviewSummaryRows(item = {}, methodOptions = []) {
  const methodLabels = mapMethodLabels(item.methods, methodOptions)

  return [
    { label: '姓名', value: item.realName || '未填写姓名' },
    { label: '学校', value: item.school || '未填写' },
    { label: '专业', value: item.major || '未填写' },
    { label: '授课方式', value: methodLabels.join(' / ') || '未填写' },
  ]
}

export function getReviewResultToast(status) {
  return Number(status) === 1 ? '已通过' : '已拒绝'
}

export function buildTutorDetailBottomActions(isAuditMode) {
  if (isAuditMode) {
    return [
      { key: 'reject', text: '拒绝', status: 2 },
      { key: 'pass', text: '通过', status: 1 },
    ]
  }

  return [
    { key: 'contact', text: '立即联系' },
  ]
}
