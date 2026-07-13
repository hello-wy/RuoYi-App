import { beforeEach, describe, expect, test, vi } from 'vitest'

const request = vi.fn()
vi.mock('@/utils/request', () => ({ default: request }))

beforeEach(() => request.mockReset())

describe('mini user api adapter', () => {
  test('keeps numeric user type zero and normalizes student flag', async () => {
    request.mockResolvedValue({ rows: [{ userId: 7, nickName: '小智', isStudent: 1 }], total: 1 })
    const { listMiniUsers } = await import('./miniUser')

    const result = await listMiniUsers({ pageNum: 1, pageSize: 10, userType: 0 })

    expect(request).toHaveBeenCalledWith({
      url: '/system/mini-user/list',
      method: 'get',
      params: { pageNum: 1, pageSize: 10, userType: 0 },
      adminAuth: true
    })
    expect(result).toEqual({
      rows: [expect.objectContaining({ id: 7, displayName: '小智', isStudent: true })],
      total: 1
    })
  })
})
