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
})
