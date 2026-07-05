import { isAdminUser } from '@/utils/admin'

export function createAdminSessionSnapshot(token, roles = []) {
  if (!isAdminUser(token, roles)) {
    return null
  }
  return {
    token,
    roles: ['admin']
  }
}
