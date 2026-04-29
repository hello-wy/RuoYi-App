function toTagValue(value) {
  return String(value || '').split(',').map(item => item.trim()).filter(Boolean)
}

export function buildParentListTags(detail = {}) {
  const tags = []

  if (detail.grade) {
    tags.push({
      dict: 'sys_class',
      value: toTagValue(detail.grade)
    })
  }

  if (detail.subject) {
    tags.push({
      dict: 'sys_subject',
      value: toTagValue(detail.subject)
    })
  }

  return tags
}

export function buildParentDetailQuickTags(detail = {}) {
  const tags = []

  if (detail.grade) {
    tags.push({
      icon: 'person',
      dict: 'sys_class',
      value: toTagValue(detail.grade)
    })
  }

  if (detail.subject) {
    tags.push({
      icon: 'compose',
      dict: 'sys_subject',
      value: toTagValue(detail.subject)
    })
  }

  if (detail.methods) {
    tags.push({
      icon: 'time',
      dict: 'sys_methods',
      value: toTagValue(detail.methods)
    })
  }

  return tags
}
