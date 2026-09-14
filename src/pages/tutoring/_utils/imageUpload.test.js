import { describe, expect, test } from 'vitest'
import { getImageValidationError } from './imageUpload'

const THREE_MEGABYTES = 3 * 1024 * 1024

describe('tutoring image upload validation', () => {
  test('allows a supported image exactly three megabytes', () => {
    expect(getImageValidationError({ path: '/tmp/material.png', size: THREE_MEGABYTES })).toBe('')
  })

  test('rejects an image larger than three megabytes', () => {
    expect(getImageValidationError({ path: '/tmp/material.jpg', size: THREE_MEGABYTES + 1 }))
      .toBe('图片大小不能超过 3MB')
  })

  test('rejects unsupported file extensions before upload', () => {
    expect(getImageValidationError({ path: '/tmp/material.pdf', size: 1024 }))
      .toBe('仅支持 JPG、JPEG、PNG 格式图片')
  })

  test('extracts upload URL from wrapped response data', async () => {
    const { buildUploadedCertificateUrl } = await import('./imageUpload')
    expect(buildUploadedCertificateUrl({ data: { fileName: '/profile/avatar/1.png' } }))
      .toBe('/profile/avatar/1.png')
  })
})
