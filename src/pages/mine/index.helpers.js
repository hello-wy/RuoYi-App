import { USER_TYPES } from '@/utils/userType'

const PARENT_ONLY_MENU_KEYS = Object.freeze(['baby', 'coursePackage'])
const ALWAYS_VISIBLE_MENU_KEYS = Object.freeze(['schedule'])

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
