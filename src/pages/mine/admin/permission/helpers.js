function unwrapPayload(payload = {}) {
  return payload.data && !Array.isArray(payload.data) ? payload.data : payload
}

function normalizeIds(values = []) {
  if (!Array.isArray(values)) return []
  return values
    .map(item => typeof item === 'object' ? (item.id ?? item.menuId ?? item.permissionId) : item)
    .filter(id => id !== undefined && id !== null)
    .map(String)
}

export function normalizePermissionCatalog(payload = {}) {
  const data = unwrapPayload(payload)
  const source = Array.isArray(payload.data)
    ? payload.data
    : (data.groups || data.permissionGroups || (Array.isArray(data) ? data : []))
  const catalogMeta = Array.isArray(payload.data) ? payload : data
  const hasGrantableIds = Object.prototype.hasOwnProperty.call(catalogMeta, 'grantablePermissionIds')
    || Object.prototype.hasOwnProperty.call(payload, 'grantablePermissionIds')
  const grantableIds = new Set(normalizeIds(catalogMeta.grantablePermissionIds ?? payload.grantablePermissionIds))
  const groups = (Array.isArray(source) ? source : []).map((group, index) => ({
    key: String(group.key || group.groupKey || group.name || group.groupName || group.label || index),
    name: group.name || group.groupName || group.label || '其他权限',
    description: group.description || group.remark || '',
    permissions: (group.permissions || group.items || group.children || []).map(item => {
      const id = item.id ?? item.menuId ?? item.permissionId
      return {
        id,
        name: item.name || item.menuName || item.label || item.permissionName || '未命名权限',
        description: item.description || item.remark || '',
        permission: item.permission || item.perms || '',
        grantable: typeof item.grantable === 'boolean' ? item.grantable : (!hasGrantableIds || grantableIds.has(String(id)))
      }
    }).filter(item => item.id !== undefined && item.id !== null)
  })).filter(group => group.permissions.length > 0)
  return { groups }
}

export function normalizePermissionGroups(payload = {}) {
  return normalizePermissionCatalog(payload).groups
}

export function normalizePermissionUsers(payload = {}) {
  const rows = payload.rows || payload.users || payload.data || []
  if (!Array.isArray(rows)) return []
  return rows.map(user => ({
    ...user,
    userId: user.userId ?? user.id,
    displayName: user.nickName || user.realName || user.userName || '未命名用户',
    account: user.phonenumber || user.userName || '',
    departmentName: user.deptName || user.dept?.deptName || '未分配部门',
    readOnly: Boolean(user.readOnly || user.protected || user.superAdmin || user.admin)
  }))
}

export function normalizeUserPermissionDetail(payload = {}) {
  const data = unwrapPayload(payload)
  const readOnly = Boolean(data.readOnly || data.protected || data.superAdmin || data.admin)
  return {
    permissionIds: normalizeIds(data.permissionIds || data.menuIds || data.permissions),
    inheritedPermissionIds: normalizeIds(data.inheritedPermissionIds || data.inheritedMenuIds),
    readOnly,
    readOnlyReason: readOnly ? (data.readOnlyReason || data.reason || '超级管理员权限由系统维护，不可修改') : ''
  }
}

export function samePermissionIds(left = [], right = []) {
  const normalize = values => [...new Set(values.map(String))].sort()
  return JSON.stringify(normalize(left)) === JSON.stringify(normalize(right))
}
