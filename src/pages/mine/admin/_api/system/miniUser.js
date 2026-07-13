import request from '@/utils/request'

function normalizeUser(item = {}) {
  return {
    ...item,
    id: item.id ?? item.userId,
    displayName: item.displayName || item.nickName || item.nickname || item.realName || item.userName || '未命名用户',
    phone: item.phone || item.phonenumber || '',
    avatar: item.avatar || item.avatarUrl || '',
    userType: item.userType ?? '',
    isStudent: item.isStudent === true || item.isStudent === 1 || item.isStudent === '1'
  }
}

export async function listMiniUsers(params) {
  const res = await request({
    url: '/system/mini-user/list',
    method: 'get',
    params,
    adminAuth: true
  })
  return {
    rows: (Array.isArray(res.rows) ? res.rows : []).map(normalizeUser),
    total: Number(res.total || 0)
  }
}

export async function getMiniUser(id) {
  const res = await request({
    url: `/system/mini-user/${id}`,
    method: 'get',
    adminAuth: true
  })
  return normalizeUser(res.data || {})
}
