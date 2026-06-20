import { describe, expect, test, vi } from 'vitest'

vi.mock('@/utils/request', () => ({
  default: vi.fn(config => config)
}))

describe('login api', () => {
  test('uses wxmini login endpoint before requesting phone code', async () => {
    const { wxminiLogin } = await import('./login')

    expect(wxminiLogin('wx-app', 'login-code')).toEqual({
      url: '/wxmini/login',
      headers: {
        isToken: false
      },
      method: 'get',
      params: {
        appid: 'wx-app',
        code: 'login-code'
      }
    })
  })

  test('passes optional phone code through wxmini login endpoint', async () => {
    const { wxminiLogin } = await import('./login')

    expect(wxminiLogin('wx-app', 'login-code', 'phone-code')).toEqual({
      url: '/wxmini/login',
      headers: {
        isToken: false
      },
      method: 'get',
      params: {
        appid: 'wx-app',
        code: 'login-code',
        phoneCode: 'phone-code'
      }
    })
  })
})
