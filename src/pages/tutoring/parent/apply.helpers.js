import { normalizeUserType, USER_TYPES } from '@/utils/userType'

export function canUseBabyPicker(userType) {
  return normalizeUserType(userType) === USER_TYPES.PARENT
}

export function buildBabyDisplayName(baby = {}) {
  const realName = (baby.realName || '').trim()
  const nickName = (baby.nickName || '').trim()
  if (realName && nickName) return `${realName}（${nickName}）`
  if (realName) return realName
  if (nickName) return nickName
  return '未命名萌娃'
}

function buildBabyMeta(baby = {}) {
  return (baby.grade || baby.birthDate || '').trim()
}

export function normalizeBabyList(list = []) {
  return (Array.isArray(list) ? list : []).map(item => ({
    id: item.id,
    realName: item.realName,
    displayName: buildBabyDisplayName(item),
    meta: buildBabyMeta(item)
  }))
}

export function shouldShowBabyEmptyState(visible, babyList) {
  return Boolean(visible) && (!Array.isArray(babyList) || babyList.length === 0)
}
