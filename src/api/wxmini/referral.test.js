import { beforeEach, describe, expect, test, vi } from 'vitest'

const { request, getToken, getAdminToken, getCachedShareInviteCode, cacheShareInviteCode } = vi.hoisted(() => ({
  request: vi.fn(),
  getToken: vi.fn(),
  getAdminToken: vi.fn(),
  getCachedShareInviteCode: vi.fn(),
  cacheShareInviteCode: vi.fn()
}))

vi.mock('@/utils/request', () => ({ default: request }))
vi.mock('@/utils/auth', () => ({ getToken, getAdminToken }))
vi.mock('@/utils/invite-share', () => ({
  cacheShareInviteCode,
  getCachedShareInviteCode
}))

describe('邀请关系 API', () => {
  beforeEach(() => {
    request.mockReset()
    request.mockImplementation(config => Promise.resolve(config))
    getToken.mockReset()
    getAdminToken.mockReset()
    getCachedShareInviteCode.mockReset()
    cacheShareInviteCode.mockReset()
    globalThis.uni = {}
    getCachedShareInviteCode.mockReturnValue('')
  })

  test('本地已有邀请码时直接使用缓存，不请求接口', async () => {
    getToken.mockReturnValue('system-token')
    getAdminToken.mockReturnValue('system-token')
    getCachedShareInviteCode.mockReturnValue('CACHED01')

    const { getMyReferralCode } = await import('./referral')
    await expect(getMyReferralCode()).resolves.toEqual({
      code: 200,
      msg: '使用本地缓存的邀请码',
      data: { inviteCode: 'CACHED01' }
    })

    expect(request).not.toHaveBeenCalled()
  })

  test('system 用户没有本地邀请码时不请求接口', async () => {
    getToken.mockReturnValue('system-token')
    getAdminToken.mockReturnValue('system-token')

    const { getMyReferralCode } = await import('./referral')
    await expect(getMyReferralCode()).resolves.toBeNull()

    expect(request).not.toHaveBeenCalled()
  })

  test('wxmini 用户没有缓存时请求接口并保存邀请码', async () => {
    getToken.mockReturnValue('wxmini-token')
    getAdminToken.mockReturnValue('system-token')
    request.mockResolvedValueOnce({
      code: 200,
      data: { inviteCode: 'WXCODE01', inviteCount: 2 }
    })

    const { getMyReferralCode } = await import('./referral')
    await expect(getMyReferralCode()).resolves.toEqual({
      code: 200,
      data: { inviteCode: 'WXCODE01', inviteCount: 2 }
    })

    expect(request).toHaveBeenCalledWith({
      url: '/wxmini/referral/my-code',
      method: 'get'
    })
    expect(cacheShareInviteCode).toHaveBeenCalledWith('WXCODE01')
  })

  test('当前登录用户分页获取两级邀请树', async () => {
    const { getMyReferralTree } = await import('./referral')

    await expect(getMyReferralTree({ pageNum: 1, pageSize: 1 })).resolves.toEqual({
      url: '/wxmini/referral/tree',
      method: 'get',
      params: { pageNum: 1, pageSize: 1 }
    })
  })

  test('管理员按小程序用户 ID 获取一、二级邀请关系', async () => {
    const { getReferralTree } = await import('./referral')

    await expect(getReferralTree('wx-user-001')).resolves.toEqual({
      url: '/system/referral/tree',
      adminAuth: true,
      method: 'get',
      params: { userId: 'wx-user-001' }
    })
  })
})
