import { describe, expect, test } from 'vitest'
import { resolveCompletedCount } from './index.helpers'

describe('resolveCompletedCount', () => {
  test('uses unwrapped count value returned by personality API', () => {
    expect(resolveCompletedCount(12)).toBe(12)
  })
})
