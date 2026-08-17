import { describe, expect, test, vi } from 'vitest'

vi.mock('@/utils/request', () => ({
  default: vi.fn(config => Promise.resolve(config))
}))

describe('邀请关系 API', () => {
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
