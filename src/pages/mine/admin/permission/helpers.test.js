import { describe, expect, test } from 'vitest'
import { normalizePermissionCatalog, normalizePermissionGroups, normalizePermissionUsers, normalizeUserPermissionDetail, samePermissionIds } from './helpers'

describe('permission management helpers', () => {
  test('normalizes grouped menu permissions', () => {
    expect(normalizePermissionGroups({ groups: [{ groupName: '用户', items: [{ menuId: 10, menuName: '查看用户', perms: 'system:user:list' }] }] })).toEqual([
      {
        key: '用户',
        name: '用户',
        description: '',
        permissions: [{ id: 10, name: '查看用户', description: '', permission: 'system:user:list', grantable: true }]
      }
    ])
  })

  test('normalizes catalog grantability from rule flags or a top-level allowlist', () => {
    expect(normalizePermissionCatalog({
      data: {
        groups: [{ name: '用户', permissions: [{ id: 1 }, { id: 2 }] }],
        grantablePermissionIds: [2]
      }
    }).groups[0].permissions).toMatchObject([
      { id: 1, grantable: false },
      { id: 2, grantable: true }
    ])
    expect(normalizePermissionGroups({ data: [{ name: '用户', permissions: [{ id: 1 }, { id: 2, grantable: false }] }] })[0].permissions).toMatchObject([
      { id: 1, grantable: true },
      { id: 2, grantable: false }
    ])
  })

  test('normalizes inherited permissions and read-only reasons', () => {
    expect(normalizePermissionUsers({ rows: [{ userId: 1, nickName: '管理员', admin: true }] })[0]).toMatchObject({
      displayName: '管理员',
      readOnly: true
    })
    expect(normalizeUserPermissionDetail({ menuIds: [2, 1], inheritedPermissionIds: [3], superAdmin: true })).toMatchObject({
      permissionIds: ['2', '1'],
      inheritedPermissionIds: ['3'],
      readOnly: true,
      readOnlyReason: '超级管理员权限由系统维护，不可修改'
    })
    expect(normalizeUserPermissionDetail({ permissionIds: [1], readOnlyReason: '不应显示' })).toMatchObject({
      readOnly: false,
      readOnlyReason: ''
    })
  })

  test('compares permission ids independent of order and duplicates', () => {
    expect(samePermissionIds([2, '1', 2], ['2', 1])).toBe(true)
    expect(samePermissionIds([1], [1, 2])).toBe(false)
  })
})
