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
