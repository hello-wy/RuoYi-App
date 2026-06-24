import { USER_TYPES } from '@/utils/userType'

const PARENT_ONLY_MENU_KEYS = Object.freeze(['baby', 'coursePackage'])
const ALWAYS_VISIBLE_MENU_KEYS = Object.freeze(['schedule'])
const ADMIN_MENU_KEYS = Object.freeze(['admin', 'setting'])

export function shouldShowMineMenuItem(item, normalizedUserType) {
  if (ALWAYS_VISIBLE_MENU_KEYS.includes(item.key)) {
    return true
  }
  if (PARENT_ONLY_MENU_KEYS.includes(item.key)) {
    return normalizedUserType === USER_TYPES.PARENT
  }
  if (Object.prototype.hasOwnProperty.call(item, 'visible')) {
    return typeof item.visible === 'function' ? item.visible() : Boolean(item.visible)
  }
  return true
}

export function filterMineMenuItems(menuItems, normalizedUserType) {
  return menuItems.filter(item => shouldShowMineMenuItem(item, normalizedUserType))
}

export function buildMinePageModel({ isAdmin, hasLogin, normalizedUserType, menuItems }) {
  if (isAdmin) {
    return {
      showRegularContent: false,
      showPrimaryCard: false,
      showAgentEntry: false,
      menuItems: menuItems.filter(item => ADMIN_MENU_KEYS.includes(item.key) && isMenuItemVisible(item))
    }
  }
  return {
    showRegularContent: true,
    showPrimaryCard: hasLogin,
    showAgentEntry: true,
    menuItems: filterMineMenuItems(menuItems, normalizedUserType)
  }
}

function isMenuItemVisible(item) {
  if (!Object.prototype.hasOwnProperty.call(item, 'visible')) return true
  return typeof item.visible === 'function' ? item.visible() : Boolean(item.visible)
}
