import { describe, expect, test, vi } from 'vitest'

vi.mock('@/utils/request', () => ({
  default: vi.fn(config => config)
}))

vi.mock('@/utils/upload', () => ({
  default: vi.fn(config => config)
}))

describe('wxmini jobs api', () => {
  test('uploads job attendance image with wxmini upload endpoint', async () => {
    const { uploadJobAttendanceImage } = await import('./jobs')

    expect(uploadJobAttendanceImage('/tmp/sign.jpg')).toEqual({
      url: '/wxmini/common/uploadJobSignImage',
      filePath: '/tmp/sign.jpg',
      name: 'file',
      showError: false
    })
  })

  test('submits uploaded attendance image for a job schedule', async () => {
    const { submitJobAttendanceImage } = await import('./jobs')

    expect(submitJobAttendanceImage(18, '/profile/job-sign/321/18.jpg')).toEqual({
      url: '/wxmini/jobs/18/sign-in',
      method: 'post',
      data: { signImageUrl: '/profile/job-sign/321/18.jpg' }
    })
  })
  test('updates merchant job status', async () => {
    const { updateMerchantJobStatus } = await import('./jobs')

    expect(updateMerchantJobStatus(18, { status: 3 })).toEqual({
      url: '/wxmini/jobs/18/status',
      method: 'post',
      data: { status: 3 }
    })
  })
})
