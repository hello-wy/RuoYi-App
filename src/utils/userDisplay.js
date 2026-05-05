const PHONE_MASK_PATTERN = /^(\d{3})\d{4}(\d{4})$/

export function maskPhone(phone) {
  const value = String(phone || '').trim()
  if (!PHONE_MASK_PATTERN.test(value)) return ''
  return value.replace(PHONE_MASK_PATTERN, '$1****$2')
}

export function isRealnameAuthed(value) {
  return Number(value) === 1 || value === true
}

export function resolveUserDisplayName(profile = {}) {
  const realName = String(profile.realName || '').trim()
  if (realName) return realName
  return maskPhone(profile.phone || '')
}

export function resolveProfileRealNameText(profile = {}) {
  if (!isRealnameAuthed(profile.isRealnameAuth)) return '未实名'
  return String(profile.realName || '').trim() || '未实名'
}
