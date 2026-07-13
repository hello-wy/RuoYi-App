import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const STYLE_FILE = new URL('./index.scss', import.meta.url)

describe('管理后台首页样式', () => {
  it('保留管理入口网格及待办角标的布局规则', () => {
    const styles = readFileSync(STYLE_FILE, 'utf8')

    expect(styles).toMatch(/\.admin-grid\s*\{[\s\S]*display:\s*grid/)
    expect(styles).toContain('.admin-action')
    expect(styles).toContain('.action-badge')
    expect(styles).toContain('.action-icon')
    expect(styles).toContain('.action-label')
  })
})
