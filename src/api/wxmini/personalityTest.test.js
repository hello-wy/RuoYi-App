import { describe, expect, test, vi } from 'vitest'

vi.mock('@/utils/request', () => ({
  default: vi.fn(config => Promise.resolve({ data: config }))
}))

describe('wxmini personality test api', () => {
  test('gets a personality question by number', async () => {
    const { getPersonalityQuestion } = await import('./personalityTest')

    await expect(getPersonalityQuestion(12, 37)).resolves.toEqual({
      url: '/wxmini/personality-test/attempts/12/questions/37',
      method: 'get'
    })
  })

  test('normalizes old single report result shape centrally', async () => {
    const request = (await import('@/utils/request')).default
    request.mockResolvedValueOnce({ data: { report: { type: 6, summary: '6号解读' } } })
    const { getPersonalityResult } = await import('./personalityTest')

    await expect(getPersonalityResult(12)).resolves.toEqual({
      report: { type: 6, summary: '6号解读' },
      reports: [{ type: 6, summary: '6号解读' }]
    })
  })
})
