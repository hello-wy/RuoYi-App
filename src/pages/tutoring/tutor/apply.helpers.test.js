import { describe, expect, test, vi } from 'vitest'
import {
  chooseWechatAlbumImage,
  isChooseImageCanceled,
  isChooseImagePermissionDenied,
  normalizeSelectedImage,
  requestWechatImagePrivacyAuthorization
} from './apply.helpers'

describe('apply.helpers', () => {
  test('treats only real permission-denied errors as permission issues', () => {
    expect(isChooseImagePermissionDenied({ errCode: 1101005 })).toBe(true)
    expect(isChooseImagePermissionDenied({ errMsg: 'chooseImage:fail auth deny' })).toBe(true)
    expect(isChooseImagePermissionDenied({ message: '未授权访问相册' })).toBe(true)

    expect(isChooseImagePermissionDenied({ errMsg: 'chooseImage:fail invalid sourceType' })).toBe(false)
    expect(isChooseImagePermissionDenied({ errMsg: 'chooseImage:fail camera unavailable' })).toBe(false)
    expect(isChooseImagePermissionDenied({ errMsg: 'chooseImage:fail album config missing' })).toBe(false)
    expect(isChooseImagePermissionDenied({ errMsg: 'chooseImage:fail scope is not declared in privacy config' })).toBe(false)
  })

  test('detects user-cancelled image selection', () => {
    expect(isChooseImageCanceled('chooseImage:fail cancel')).toBe(true)
    expect(isChooseImageCanceled('用户取消选择')).toBe(true)
    expect(isChooseImageCanceled('chooseImage:fail auth deny')).toBe(false)
  })

  test('normalizes selected image fields from chooseImage result', () => {
    expect(normalizeSelectedImage({
      tempFilePath: '/tmp/cert.png',
      size: '128'
    })).toEqual({
      tempFilePath: '/tmp/cert.png',
      path: '/tmp/cert.png',
      size: 128
    })

    expect(normalizeSelectedImage({
      path: '/tmp/cert.jpg',
      tempFilePath: '',
      size: 0,
      name: 'cert'
    })).toEqual({
      path: '/tmp/cert.jpg',
      tempFilePath: '/tmp/cert.jpg',
      size: 0,
      name: 'cert'
    })
  })

  test('requests wechat privacy authorization when supported', async () => {
    const requirePrivacyAuthorize = vi.fn(({ success }) => success())
    const wxApi = {
      requirePrivacyAuthorize
    }

    await expect(requestWechatImagePrivacyAuthorization(wxApi)).resolves.toBeUndefined()
    expect(requirePrivacyAuthorize).toHaveBeenCalledTimes(1)
  })

  test('skips wechat privacy authorization when unsupported', async () => {
    const wxApiWithoutPrivacy = {}
    await expect(requestWechatImagePrivacyAuthorization(wxApiWithoutPrivacy)).resolves.toBeUndefined()
  })

  test('uses chooseMedia first on wechat and normalizes result', async () => {
    const chooseMedia = vi.fn(({ success }) => success({
      tempFiles: [{ tempFilePath: '/tmp/media.png', size: '256' }]
    }))
    const chooseImage = vi.fn()

    await expect(chooseWechatAlbumImage({ chooseMedia, chooseImage })).resolves.toEqual({
      tempFilePath: '/tmp/media.png',
      path: '/tmp/media.png',
      size: 256
    })

    expect(chooseMedia).toHaveBeenCalledTimes(1)
    expect(chooseMedia).toHaveBeenCalledWith(expect.objectContaining({
      mediaType: ['image'],
      sourceType: ['album']
    }))
    expect(chooseImage).not.toHaveBeenCalled()
  })

  test('falls back to chooseImage when chooseMedia is unavailable', async () => {
    const chooseImage = vi.fn(({ success }) => success({
      tempFilePaths: ['/tmp/fallback.jpg'],
      tempFiles: [{ path: '/tmp/fallback.jpg', size: 12 }]
    }))

    await expect(chooseWechatAlbumImage({ chooseImage })).resolves.toEqual({
      path: '/tmp/fallback.jpg',
      tempFilePath: '/tmp/fallback.jpg',
      size: 12
    })

    expect(chooseImage).toHaveBeenCalledWith(expect.objectContaining({
      sourceType: ['album'],
      sizeType: ['compressed']
    }))
  })
})
