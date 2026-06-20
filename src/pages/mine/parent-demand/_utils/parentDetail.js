function parseCsv(value) {
  return String(value || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

function parseServiceSlots(value) {
  try {
    const parsed = JSON.parse(String(value || '').trim() || '[]')
    if (Array.isArray(parsed)) {
      return parsed
        .map(item => ({
          startTime: String(item?.startTime || '').trim(),
          endTime: String(item?.endTime || '').trim()
        }))
        .filter(item => item.startTime || item.endTime)
    }
  } catch (e) {}
  return []
}

export function normalizeParentDetail(detail) {
  if (!detail || typeof detail !== 'object') return null
  if (!detail.id && !detail.name && !detail.region && !detail.location && !detail.brief && !detail.requirements) {
    return null
  }
  return detail
}

export function getParentDetailLocationText(detail = {}) {
  if (detail.location) return detail.location
  if (detail.region) return `${detail.region}（详细地址接单后可见）`
  return '未提供上课地点'
}

export function getParentServiceDateText(detail = {}) {
  const dates = parseCsv(detail.serviceDates)
  if (dates.length) return dates.join('、')
  const dayMap = { '1': '周一', '2': '周二', '3': '周三', '4': '周四', '5': '周五', '6': '周六', '7': '周日' }
  const days = parseCsv(detail.dayOfWeek).map(day => dayMap[day] || '').filter(Boolean)
  return days.length ? days.join('、') : '未设置服务日期'
}

export function getParentServiceTimeText(detail = {}) {
  const slots = parseServiceSlots(detail.serviceTimes)
  if (slots.length) {
    return slots.map(item => [item.startTime, item.endTime].filter(Boolean).join('-')).filter(Boolean).join(' / ')
  }
  if (detail.startTime && detail.endTime) return `${detail.startTime}-${detail.endTime}`
  return detail.startTime || detail.endTime || '未设置服务时段'
}

export function getParentDemandItemValues(detail = {}) {
  return parseCsv(detail.demandItems)
}
