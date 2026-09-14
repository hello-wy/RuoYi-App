import { describe, expect, test, vi } from 'vitest'

vi.mock('@/utils/request', () => ({
  default: vi.fn(config => config)
}))

vi.mock('@/utils/upload', () => ({
  default: vi.fn(config => config)
}))

describe('wxmini tutoring api', () => {
  test('submits student tutoring schedule check-in', async () => {
    const { submitStudentScheduleCheckIn } = await import('./tutoring')

    expect(submitStudentScheduleCheckIn(60001, { remark: '已到达上课地点' })).toEqual({
      url: '/wxmini/tutoring/schedules/60001/finish',
      method: 'post',
      data: { remark: '已到达上课地点' }
    })
  })

  test('submits parent tutoring schedule completion', async () => {
    const { submitParentScheduleComplete } = await import('./tutoring')

    expect(submitParentScheduleComplete(60001, { remark: '确认上课完成' })).toEqual({
      url: '/wxmini/tutoring/schedules/60001/confirm',
      method: 'post',
      data: { remark: '确认上课完成' }
    })
  })

  test.each([
    [1, '/wxmini/tutoring/materials/upload/id-card-front'],
    [2, '/wxmini/tutoring/materials/upload/id-card-back'],
    [3, '/wxmini/tutoring/materials/upload/student-card'],
    [4, '/wxmini/tutoring/materials/upload/certificate']
  ])('uploads tutor material type %s through its dedicated endpoint', async (type, url) => {
    const { uploadTutorMaterialFile } = await import('./tutoring')

    expect(uploadTutorMaterialFile('/tmp/material.png', type)).toEqual({
      url,
      filePath: '/tmp/material.png',
      name: 'file',
      showError: false
    })
  })

  test('rejects unsupported tutor material upload type', async () => {
    const { uploadTutorMaterialFile } = await import('./tutoring')

    expect(() => uploadTutorMaterialFile('/tmp/material.png', 9))
      .toThrow('不支持的材料类型')
  })

  test('uploads tutor avatar through wxmini endpoint', async () => {
    const { uploadTutorAvatar } = await import('./tutoring')
    expect(uploadTutorAvatar('/tmp/avatar.jpg')).toEqual({
      url: '/wxmini/common/uploadAvatar', filePath: '/tmp/avatar.jpg', name: 'file', showError: false
    })
  })

})
