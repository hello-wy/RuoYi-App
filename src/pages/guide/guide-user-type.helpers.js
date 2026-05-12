export function filterGuideRoles(allRoles = [], switchableUserTypes) {
  if (!Array.isArray(switchableUserTypes) || switchableUserTypes.length === 0) {
    return allRoles
  }
  return allRoles.filter(role => switchableUserTypes.includes(role.value))
}

export function resolveGuideSelectedRole(selectedRole, roles = []) {
  if (roles.some(role => role.value === selectedRole)) {
    return selectedRole
  }
  return roles[0]?.value ?? 0
}

export function resolveGuideRoleState(allRoles = [], selectedRole, profile = {}) {
  const roles = filterGuideRoles(allRoles, profile.switchableUserTypes)
  return {
    roles,
    selectedRole: resolveGuideSelectedRole(selectedRole, roles),
  }
}
