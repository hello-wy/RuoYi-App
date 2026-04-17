export const ORDER_TYPE_OPTIONS = [
  { key: 'all', label: '全部订单' },
  { key: 'salon', label: '沙龙订单' },
  { key: 'job', label: '兼职订单' }
]

export const STATUS_FILTER_OPTIONS = [
  { key: 'all', label: '全部' },
  { key: 'paid', label: '已支付' },
  { key: 'canceled', label: '已取消' },
  { key: 'refunded', label: '已退款' }
]

const STATUS_LABEL_MAP = {
  paid: '已支付',
  canceled: '已取消',
  refunded: '已退款'
}

export function sortOrders(list) {
  return [...list].sort((a, b) => getSortTime(b) - getSortTime(a))
}

export function mapSalonStatus(status) {
  const current = String(status || '').toUpperCase()
  if (current === 'PAID') return 'paid'
  if (current === 'REFUNDED') return 'refunded'
  return 'canceled'
}

export function mapJobStatus(status) {
  const current = Number(status)
  if (current === 1) return 'paid'
  if (current === 2 || current === 3) return 'refunded'
  if (current === 4) return 'canceled'
  return 'canceled'
}

export function getStatusLabel(statusKey) {
  return STATUS_LABEL_MAP[statusKey] || STATUS_LABEL_MAP.canceled
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

function getSortTime(item) {
  return parseTime(item.payTime) || parseTime(item.createTime) || 0
}

function parseTime(value) {
  if (!value) return 0
  const ts = new Date(value).getTime()
  return Number.isNaN(ts) ? 0 : ts
}
