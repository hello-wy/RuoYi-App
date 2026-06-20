import { describe, expect, test, vi } from 'vitest'
import request from '@/utils/request'
import { applyWithdraw } from './wallet'

vi.mock('@/utils/request', () => ({
  default: vi.fn()
}))

describe('wxmini wallet api', () => {
  test('keeps withdraw failure userMessage at response data level', async () => {
    request.mockRejectedValueOnce({
      code: 500,
      msg: '请先完成实名认证后再提现',
      data: {
        code: 500,
        msg: '请先完成实名认证后再提现',
        data: {
          success: false,
          status: 2,
          userMessage: '请先完成实名认证后再提现'
        }
      }
    })

    await expect(applyWithdraw('10.00')).resolves.toEqual({
      code: 500,
      msg: '请先完成实名认证后再提现',
      data: {
        success: false,
        status: 2,
        userMessage: '请先完成实名认证后再提现'
      }
    })
  })
})
