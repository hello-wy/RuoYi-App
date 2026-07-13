import { beforeEach, describe, expect, test, vi } from 'vitest'

const request = vi.fn()
vi.mock('@/utils/request', () => ({ default: request }))

beforeEach(() => request.mockReset())

describe('student api adapter', () => {
  test('only keeps paid course orders that are waiting to sign in as enrollment records', async () => {
    request.mockResolvedValue({
      data: {
        enrollmentRecords: [
          { orderId: 1, status: 0, courseName: '待支付课程' },
          { orderId: 2, status: 1, courseName: '已报名课程' },
          { orderId: 3, status: 2, courseName: '已签到课程' },
          { orderId: 4, status: 4, courseName: '已取消课程' }
        ],
        signInRecords: []
      }
    })
    const { getStudentLearningRecords } = await import('./student')

    const result = await getStudentLearningRecords(8)

    expect(request).toHaveBeenCalledWith({
      url: '/system/student/8/learning-records',
      adminAuth: true,
      method: 'get'
    })
    expect(result.enrollmentRecords).toEqual([
      expect.objectContaining({ id: 2, status: 1, courseName: '已报名课程' })
    ])
  })
})
