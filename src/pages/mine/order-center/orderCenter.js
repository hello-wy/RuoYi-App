export const ORDER_TYPE_OPTIONS = [
  { key: 'all', label: '全部订单' },
  { key: 'salon', label: '沙龙订单' },
  { key: 'job', label: '兼职订单' },
  { key: 'course', label: '课程订单' },
  { key: 'tutoringPackage', label: '家教课时包' }
]

export const STATUS_FILTER_OPTIONS = [
  { key: 'all', label: '全部' },
  { key: 'paid', label: '已支付' },
  { key: 'signIn', label: '已签到' },
  { key: 'refunded', label: '已退款' }
]

const STATUS_LABEL_MAP = {
  pending: '待支付',
  paid: '已支付',
  signIn: '已签到',
  canceled: '已取消',
  refunded: '已退款'
}
const DEFAULT_TYPE_FILTER = 'all'
const DEFAULT_STATUS_FILTER = 'all'
const DISPLAYABLE_STATUS_KEYS = new Set(['paid', 'signIn', 'refunded'])
const ORDER_DATE_TIME_PATTERN = /^(\d{4})[-/](\d{2})[-/](\d{2})(?:[ T](\d{2}):(\d{2})(?::\d{2})?(?:Z|[+-]\d{2}:?\d{2})?)?$/
const MONTH_INDEX_OFFSET = 1

export function sortOrders(list) {
  return [...list].sort((a, b) => getSortTime(b) - getSortTime(a))
}

export function mapSalonStatus(status) {
  const current = String(status || '').toUpperCase()
  if (current === 'PENDING') return 'pending'
  if (current === 'PAID') return 'paid'
  if (current === 'REFUNDED') return 'refunded'
  return 'canceled'
}

export function mapJobStatus(status) {
  const current = Number(status)
  if (current === 0) return 'pending'
  if (current === 1) return 'paid'
  if (current === 2 || current === 3) return 'refunded'
  if (current === 4) return 'canceled'
  return 'canceled'
}

export function mapCourseStatus(status) {
  const current = Number(status)
  if (current === 0) return 'pending'
  if (current === 1) return 'paid'
  if (current === 2) return 'signIn'
  if (current === 3) return 'refunded'
  return 'canceled'
}

export function mapTutoringStatus(status) {
  const current = Number(status)
  if (current === 0) return 'pending'
  if (current === 1) return 'paid'
  if (current === 2) return 'canceled'
  return 'canceled'
}

export function getStatusLabel(statusKey) {
  return STATUS_LABEL_MAP[statusKey] || STATUS_LABEL_MAP.canceled
}

export function isDisplayableOrderStatus(statusKey) {
  return DISPLAYABLE_STATUS_KEYS.has(statusKey)
}

export function formatOrderDateTime(value) {
  if (!value) return '--'
  const text = String(value).trim()
  const matched = text.match(ORDER_DATE_TIME_PATTERN)
  if (!matched) return text
  const [, year, month, day, hour = '00', minute = '00'] = matched
  return `${year}-${month}-${day} ${hour}:${minute}`
}

export function filterOrdersByType(list, typeKey) {
  if (typeKey === 'all') return list
  return list.filter(item => item.type === typeKey)
}

export function filterOrdersByStatus(list, statusKey) {
  if (statusKey === 'all') return list
  return list.filter(item => item.statusKey === statusKey)
}

export function getEmptyText(typeKey, statusKey) {
  const typeLabel = ORDER_TYPE_OPTIONS.find(item => item.key === typeKey)?.label || '订单'
  const statusLabel = STATUS_FILTER_OPTIONS.find(item => item.key === statusKey)?.label || '全部'
  if (statusKey === 'all') {
    return `暂无${typeLabel}`
  }
  return `暂无${statusLabel}${typeLabel}`
}

export function resolveOrderCenterInitialFilters(options = {}) {
  const type = String(options.type || DEFAULT_TYPE_FILTER)
  const status = String(options.status || DEFAULT_STATUS_FILTER)
  return {
    type: hasOption(ORDER_TYPE_OPTIONS, type) ? type : DEFAULT_TYPE_FILTER,
    status: hasOption(STATUS_FILTER_OPTIONS, status) ? status : DEFAULT_STATUS_FILTER
  }
}

function getSortTime(item) {
  return parseTime(item.payTime) || parseTime(item.createTime) || 0
}

function hasOption(options, key) {
  return options.some(item => item.key === key)
}

function parseTime(value) {
  if (!value) return 0
  const matched = String(value).trim().match(ORDER_DATE_TIME_PATTERN)
  if (!matched) return 0
  const [, year, month, day, hour = '00', minute = '00'] = matched
  return Date.UTC(
    Number(year),
    Number(month) - MONTH_INDEX_OFFSET,
    Number(day),
    Number(hour),
    Number(minute)
  )
}
