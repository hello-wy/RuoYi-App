import { beforeEach, describe, expect, test, vi } from 'vitest'
import request from './request'

vi.mock('@/config', () => ({
  default: {
    baseUrl: 'http://127.0.0.1:8080'
  }
}))

vi.mock('@/utils/auth', () => ({
  getAdminToken: vi.fn(() => ''),
  getToken: vi.fn(() => '')
}))

vi.mock('@/utils/common', () => ({
  showConfirm: vi.fn(() => Promise.resolve({ confirm: false })),
  tansParams: vi.fn(() => ''),
  toast: vi.fn()
}))

describe('request', () => {
  beforeEach(() => {
    globalThis.uni = {
      request: vi.fn()
    }
  })

  test('does not call resolve after rejecting server errors', async () => {
    const NativePromise = globalThis.Promise
    const settledCalls = []
    class TrackingPromise {
      constructor(executor) {
        executor(
          value => settledCalls.push(['resolve', value]),
          error => settledCalls.push(['reject', error])
        )
      }
    }

    uni.request.mockReturnValueOnce(NativePromise.resolve({
      data: {
        code: 500,
        msg: '数据库字段缺失'
      }
    }))

    globalThis.Promise = TrackingPromise

    try {
      request({
        url: '/wxmini/profile/merchant-user-type-application',
        method: 'post'
      })
      await NativePromise.resolve()
    } finally {
      globalThis.Promise = NativePromise
    }

    expect(settledCalls.map(([type]) => type)).toEqual(['reject'])
  })

  test('rejects non-2xx responses with non-standard payloads', async () => {
    uni.request.mockReturnValueOnce(Promise.resolve({
      statusCode: 401,
      data: 'Invalid token'
    }))

    await expect(request({
      url: '/wxmini/referral/bind',
      method: 'post',
      showError: false
    })).rejects.toMatchObject({
      code: 401,
      statusCode: 401
    })
  })

  test('uses admin token for adminAuth requests', async () => {
    const { getAdminToken } = await import('@/utils/auth')
    getAdminToken.mockReturnValueOnce('system-token')
    uni.request.mockReturnValueOnce(Promise.resolve({
      data: {
        code: 200,
        data: []
      }
    }))

    await request({
      url: '/system/student/list',
      method: 'get',
      adminAuth: true
    })

    expect(uni.request).toHaveBeenCalledWith(expect.objectContaining({
      header: expect.objectContaining({
        Authorization: 'Bearer system-token'
      })
    }))
  })
})
