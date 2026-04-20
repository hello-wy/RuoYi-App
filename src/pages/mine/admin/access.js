import { useUserStore } from '@/store'
import { getToken } from '@/utils/auth'
import { isAdminUser as checkIsAdminUser } from '@/utils/admin'

const MINE_PAGE = '/pages/mine/index'
const REDIRECT_DELAY_MS = 800

export function isAdminUser() {
  const roles = useUserStore().roles
  return checkIsAdminUser(getToken(), roles)
}

export function requireAdminAccess(proxy) {
  if (isAdminUser()) {
    return true
  }

  if (proxy && proxy.$modal) {
    proxy.$modal.showToast('无权限访问')
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
