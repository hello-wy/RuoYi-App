import { beforeEach, describe, expect, test, vi } from 'vitest'
import request from './request'

vi.mock('@/config', () => ({
  default: {
    baseUrl: 'http://127.0.0.1:8080'
  }
}))

vi.mock('@/utils/auth', () => ({
  getToken: vi.fn(() => '')
}))

vi.mock('@/utils/common', () => ({
  showConfirm: vi.fn(),
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
})
