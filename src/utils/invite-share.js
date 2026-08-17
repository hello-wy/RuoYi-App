const INVITE_CODE_PARAM = 'inviteCode'
const SHARE_INVITE_CODE_STORAGE_KEY = 'shareInviteCode'
const QUERY_SEPARATOR = '&'
const PATH_QUERY_SEPARATOR = '?'

export function normalizeInviteCode(inviteCode) {
  return String(inviteCode || '').trim()
}

export function cacheShareInviteCode(inviteCode) {
  const normalizedInviteCode = normalizeInviteCode(inviteCode)
  if (!normalizedInviteCode) {
    throw new Error('分享邀请码不能为空')
  }
  uni.setStorageSync(SHARE_INVITE_CODE_STORAGE_KEY, normalizedInviteCode)
  return normalizedInviteCode
}

export function clearShareInviteCode() {
  uni.removeStorageSync(SHARE_INVITE_CODE_STORAGE_KEY)
}

export function getCachedShareInviteCode() {
  return normalizeInviteCode(uni.getStorageSync(SHARE_INVITE_CODE_STORAGE_KEY))
}

export function appendInviteCodeToQuery(query = '', inviteCode = getCachedShareInviteCode()) {
  const normalizedInviteCode = normalizeInviteCode(inviteCode)
  const queryItems = String(query || '')
    .replace(/^\?/, '')
    .split(QUERY_SEPARATOR)
    .filter(Boolean)
    .filter(item => item.split('=')[0] !== INVITE_CODE_PARAM)

  if (normalizedInviteCode) {
    queryItems.push(`${INVITE_CODE_PARAM}=${encodeURIComponent(normalizedInviteCode)}`)
  }
  return queryItems.join(QUERY_SEPARATOR)
}

export function appendInviteCodeToPath(path, inviteCode = getCachedShareInviteCode()) {
  const [pathname, query = ''] = String(path || '').split(PATH_QUERY_SEPARATOR)
  const mergedQuery = appendInviteCodeToQuery(query, inviteCode)
  return mergedQuery ? `${pathname}${PATH_QUERY_SEPARATOR}${mergedQuery}` : pathname
}
