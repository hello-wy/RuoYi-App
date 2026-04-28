export function buildParentDetailQuickTags(detail = {}) {
  if (!detail.methods) return []
  return [{
    icon: 'time',
    dict: 'sys_methods',
    value: String(detail.methods).split(',').map(item => item.trim()).filter(Boolean)
  }]
}
