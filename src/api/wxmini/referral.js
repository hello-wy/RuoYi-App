import request from '@/utils/request'

// 获取我的邀请码 + 统计
export function getMyReferralCode() {
  return request({
    url: '/wxmini/referral/my-code',
    method: 'get'
  })
}

// 获取我邀请的人列表（下级）
export function getMyInvitees(query) {
  return request({
    url: '/wxmini/referral/my-invitees',
    method: 'get',
    params: query
  })
}

// 查询谁邀请了我
export function getMyInviter() {
  return request({
    url: '/wxmini/referral/my-inviter',
    method: 'get'
  })
}

// 登录用户绑定邀请码
export function bindReferral(inviteCode) {
  return request({
    url: '/wxmini/referral/bind',
    method: 'post',
    data: { inviteCode }
  })
}

// 管理员分页获取全量邀请列表
export function listAllReferrals(query) {
  return request({
    url: '/system/referral/list',
    adminAuth: true,
    method: 'get',
    params: query
  })
}
