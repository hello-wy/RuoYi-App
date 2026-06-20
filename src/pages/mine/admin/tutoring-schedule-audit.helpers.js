const STATUS_WAIT_PARENT_CONFIRM = 1
const STATUS_WAIT_SETTLEMENT = 2
const STATUS_SETTLED = 3

function normalizeText(value = '') {
  return String(value || '').trim()
}

function firstText(values = []) {
  return values.map(normalizeText).find(Boolean) || ''
}

export function normalizeTutoringScheduleRows(rows = []) {
  return rows.map(item => ({
    ...item,
    tutorName: firstText([item.realName, item.tutorRealName, item.tutorName, item.bindTutorName])
  }))
}

export function hasParentConfirmedSchedule(item = {}) {
  return Boolean(normalizeText(item.confirmTime || item.parentConfirmTime || item.confirmedTime))
}

export function canAuditTutoringSchedule(item = {}) {
  return Number(item.status) === STATUS_WAIT_PARENT_CONFIRM && hasParentConfirmedSchedule(item)
}

export function buildTutoringAuditStatus(item = {}) {
  if (canAuditTutoringSchedule(item)) {
    return { label: '待管理员审核', type: 'pending' }
  }
  const status = Number(item.status || 0)
  if (status === STATUS_WAIT_PARENT_CONFIRM) {
    return { label: '待家长确认', type: 'warning' }
  }
  if (status === STATUS_WAIT_SETTLEMENT) {
    return { label: '待结算', type: 'approved' }
  }
  if (status === STATUS_SETTLED) {
    return { label: '已结算', type: 'approved' }
  }
  return { label: '待上课', type: 'empty' }
}

export function formatScheduleTime(item = {}) {
  const date = normalizeText(item.serviceDate || item.workDate)
  const start = normalizeText(item.startTime)
  const end = normalizeText(item.endTime)
  const range = start && end ? `${start}-${end}` : normalizeText(item.workTime)
  return [date, range].filter(Boolean).join(' ')
}

export function formatScheduleAmount(item = {}) {
  const value = Number(item.netAmount ?? item.amount ?? 0)
  if (Number.isNaN(value)) {
    return '¥0.00'
  }
  return `¥${value.toFixed(2)}`
}
