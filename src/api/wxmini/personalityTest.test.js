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

  test('gets attempt questions and normalizes embedded answer centrally', async () => {
    const request = (await import('@/utils/request')).default
    request.mockResolvedValueOnce({
      data: {
        questions: [
          {
            questionId: 1,
            questionNo: 1,
            selectedOptionId: 10,
            options: [
              { optionId: 10, label: '是', value: 1 },
              { optionId: 11, label: '否', value: 0 }
            ]
          }
        ]
      }
    })
    const { getAttemptQuestions } = await import('./personalityTest')

    await expect(getAttemptQuestions(12)).resolves.toEqual([
      {
        questionId: 1,
        questionNo: 1,
        selectedOptionId: 10,
        answerValue: 1,
        options: [
          { optionId: 10, label: '是', value: 1 },
          { optionId: 11, label: '否', value: 0 }
        ]
      }
    ])
    expect(request).toHaveBeenLastCalledWith({
      url: '/wxmini/personality-test/attempts/12/questions',
      method: 'get'
    })
  })

  test('posts batch answers through the wxmini API wrapper', async () => {
    const { batchSavePersonalityAnswers } = await import('./personalityTest')
    const answers = [{ questionId: 1, answerValue: 1 }]

    await expect(batchSavePersonalityAnswers(12, answers)).resolves.toEqual({
      url: '/wxmini/personality-test/attempts/12/answers/batch',
      method: 'post',
      data: { answers }
    })
  })
})
