import { getAdminToken, getAdminRoles } from '@/utils/auth'
import { hasAdminRole } from '@/utils/admin'

const MINE_PAGE = '/pages/mine/index'
const REDIRECT_DELAY_MS = 800

export function isAdminUser() {
  const token = getAdminToken()
  const roles = getAdminRoles()
  return Boolean(token) && hasAdminRole(roles)
}

export function requireAdminAccess(proxy) {
  if (isAdminUser()) {
    return true
  }

  if (proxy && proxy.$modal) {
    proxy.$modal.showToast('请先登录管理员账号')
  }
  setTimeout(() => {
    const pageStack = getCurrentPages()
    if (pageStack.length > 1) {
      uni.navigateBack({ delta: 1 })
      return
    }
    uni.switchTab({ url: MINE_PAGE })
  }, REDIRECT_DELAY_MS)

  return false
}
