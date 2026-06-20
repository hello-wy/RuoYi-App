import { describe, expect, test, vi } from 'vitest'

vi.mock('@/utils/request', () => ({
  default: vi.fn(config => config)
}))

vi.mock('@/utils/upload', () => ({
  default: vi.fn(config => config)
}))

describe('merchant application api', () => {
  test('uploads merchant license with wxmini endpoint', async () => {
    const { uploadMerchantLicense } = await import('./merchantApplication')

    expect(uploadMerchantLicense('/tmp/license.jpg')).toEqual({
      url: '/wxmini/common/uploadMerchantLicense',
      filePath: '/tmp/license.jpg',
      name: 'file',
      showError: false,
    })
  })

  test('submits merchant application with license url', async () => {
    const { submitMerchantApplication } = await import('./merchantApplication')

    expect(submitMerchantApplication({
      businessLicenseUrl: '/profile/merchant-license/u/a.jpg',
    })).toEqual({
      url: '/wxmini/profile/merchant-user-type-application',
      method: 'post',
      data: {
        businessLicenseUrl: '/profile/merchant-license/u/a.jpg',
      },
    })
  })
})
