import { isAdminUser } from '@/utils/admin'

export function createAdminSessionSnapshot(token, roles = []) {
  if (!isAdminUser(token, roles)) {
    return null
  }
  return {
    token,
    roles: roles.includes('admin') ? ['admin'] : ['national_general_manager']
  }
}
