import { useUserStore } from '@/store'
import { getToken } from '@/utils/auth'

const ADMIN_ROLE = 'admin'
const MINE_PAGE = '/pages/mine/index'
const REDIRECT_DELAY_MS = 800

export function isAdminUser() {
  const roles = useUserStore().roles
  return Boolean(getToken()) && Array.isArray(roles) && roles.includes(ADMIN_ROLE)
}

export function requireAdminAccess(proxy) {
  if (isAdminUser()) {
    return true
  }

  proxy?.$modal?.showToast('无权限访问')
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
