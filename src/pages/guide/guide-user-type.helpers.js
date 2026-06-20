const ROLE_ORDER = [0, 1, 2, 3]

function sortGuideRoles(roles = []) {
  return [...roles].sort((left, right) => {
    return ROLE_ORDER.indexOf(left.value) - ROLE_ORDER.indexOf(right.value)
  })
}

export function filterGuideRoles(allRoles = [], switchableUserTypes) {
  return sortGuideRoles(allRoles)
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
