import { describe, expect, test } from 'vitest'
import { buildParentApplySuccessUrl } from './apply.helpers'

describe('parent apply success navigation', () => {
  test('routes a newly published demand to its mine detail page', () => {
    expect(buildParentApplySuccessUrl('123')).toBe('/pages/tutoring/parent/detail?id=123&scene=mine')
  })
})
