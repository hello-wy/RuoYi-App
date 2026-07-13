import { readFile } from 'node:fs/promises'
import { describe, expect, test } from 'vitest'

const startPageUrl = new URL('./start.vue', import.meta.url)

async function loadStartPageSource() {
  return readFile(startPageUrl, 'utf8')
}

describe('personality start page', () => {
  test('does not expose the random-result test entry', async () => {
    const source = await loadStartPageSource()

    expect(source).not.toContain('随机生成测试结果')
    expect(source).not.toContain('handleRandomTest')
    expect(source).not.toContain('18913320708')
  })
})
