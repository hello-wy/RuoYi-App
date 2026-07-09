import { drawRoundRect, drawTags, drawTextBlock, estimateTextWidth, textBlockHeight } from './reportCanvas.helpers'

export const REPORT_CANVAS_ID = 'personalityReportCanvas'
export const REPORT_CANVAS_WIDTH = 750
export const REPORT_EXPORT_SCALE = 2

const PAGE_PADDING = 28
const CARD_PADDING = 32
const CARD_WIDTH = REPORT_CANVAS_WIDTH - PAGE_PADDING * 2
const CONTENT_WIDTH = CARD_WIDTH - CARD_PADDING * 2
const EMPTY_CARD = Object.freeze({
  title: '报告生成中',
  text: '暂未获取到报告字段，可先导出空报告卡片测试保存流程。'
})

export function buildExportablePersonalityReport(report = {}) {
  return {
    ...report,
    reports: Array.isArray(report.reports) ? report.reports : [],
    reportCount: Number(report.reportCount) || 0,
    hasReports: Boolean(report.hasReports),
    emptyCard: EMPTY_CARD
  }
}

export function drawReportImage(ctx, report) {
  return renderReportImage(ctx, report)
}

export function estimateReportImageHeight(report) {
  return renderReportImage(null, report)
}

function renderReportImage(ctx, report) {
  const drawableReport = buildExportablePersonalityReport(report)
  let y = 32
  if (ctx) {
    ctx.setFillStyle('#fff7ed')
    ctx.fillRect(0, 0, REPORT_CANVAS_WIDTH, estimateReportImageHeight(drawableReport))
  }
  y = drawOverview(ctx, drawableReport, y)
  if (drawableReport.reports.length) {
    drawableReport.reports.forEach(item => {
      y = drawReportCard(ctx, item, y + 24)
    })
  } else {
    y = drawEmptyCard(ctx, drawableReport.emptyCard, y + 24)
  }
  y = drawFooter(ctx, y + 28)
  return Math.ceil(y + 32)
}

function drawOverview(ctx, report, y) {
  const height = 194
  if (ctx) drawRoundRect(ctx, PAGE_PADDING, y, CARD_WIDTH, height, 32, '#ffffff')
  let innerY = y + CARD_PADDING
  drawTextBlock(ctx, '评估验证报告', PAGE_PADDING + CARD_PADDING, innerY, CONTENT_WIDTH, { fontSize: 24, lineHeight: 34, color: '#ea580c' })
  innerY += 46
  drawTextBlock(ctx, `共生成 ${report.reportCount} 项性格解读`, PAGE_PADDING + CARD_PADDING, innerY, CONTENT_WIDTH, { fontSize: 40, lineHeight: 56, color: '#1f2937' })
  innerY += 68
  drawTextBlock(ctx, '以下内容按测评结果分组展示，建议结合完成页截图一起保存。', PAGE_PADDING + CARD_PADDING, innerY, CONTENT_WIDTH, { fontSize: 26, lineHeight: 42, color: '#6b7280' })
  return y + height
}

function drawEmptyCard(ctx, card, y) {
  const height = 204
  if (ctx) drawRoundRect(ctx, PAGE_PADDING, y, CARD_WIDTH, height, 32, '#ffffff')
  drawTextBlock(ctx, card.title, PAGE_PADDING + CARD_PADDING, y + 44, CONTENT_WIDTH, { fontSize: 38, lineHeight: 52, color: '#111827' })
  drawTextBlock(ctx, card.text, PAGE_PADDING + CARD_PADDING, y + 110, CONTENT_WIDTH, { fontSize: 28, lineHeight: 44, color: '#6b7280' })
  return y + height
}

function drawReportCard(ctx, item, y) {
  const height = getReportCardHeight(item)
  const x = PAGE_PADDING
  if (ctx) drawRoundRect(ctx, x, y, CARD_WIDTH, height, 32, '#ffffff')
  let innerY = y + CARD_PADDING
  innerY = drawBadges(ctx, item, x + CARD_PADDING, innerY) + 18
  innerY += drawTextBlock(ctx, item.title, x + CARD_PADDING, innerY, CONTENT_WIDTH, { fontSize: 42, lineHeight: 56, color: '#111827' }) + 14
  innerY += drawTextBlock(ctx, item.intro, x + CARD_PADDING, innerY, CONTENT_WIDTH, { fontSize: 28, lineHeight: 45, color: '#6b7280' }) + 26
  innerY = drawInfoRow(ctx, '核心恐惧', item.coreFear, x + CARD_PADDING, innerY)
  innerY = drawInfoRow(ctx, '核心欲望', item.coreDesire, x + CARD_PADDING, innerY) + 24
  innerY = drawTagColumns(ctx, item, x + CARD_PADDING, innerY) + 24
  innerY = drawStateColumns(ctx, item, x + CARD_PADDING, innerY) + 24
  innerY = drawAdvice(ctx, item, x + CARD_PADDING, innerY) + 24
  innerY = drawDetails(ctx, item, x + CARD_PADDING, innerY)
  if (innerY > y + CARD_PADDING) innerY += 20
  drawBlindNote(ctx, item, x + CARD_PADDING, innerY)
  return y + height
}

function getReportCardHeight(item) {
  let height = CARD_PADDING + 58
  height += textBlockHeight(item.title, 42, 56, CONTENT_WIDTH) + 14
  height += textBlockHeight(item.intro, 28, 45, CONTENT_WIDTH) + 26
  height += getInfoRowHeight(item.coreFear)
  height += getInfoRowHeight(item.coreDesire) + 24
  height += getTagColumnsHeight(item) + 24
  height += getStateColumnsHeight(item) + 24
  height += getAdviceHeight(item) + 24
  height += getDetailsHeight(item) + 20 + getBlindNoteHeight(item)
  return height + CARD_PADDING
}

function drawBadges(ctx, item, x, y) {
  const badges = [`${item.type}号`]
  if (item.level) badges.push(item.level)
  if (item.score) badges.push(`${item.score}分`)
  let cursorX = x
  badges.forEach((badge, index) => {
    const colors = index === 0 ? ['#ffffff', '#f97316'] : index === 1 ? ['#9a3412', '#ffedd5'] : ['#166534', '#dcfce7']
    const width = estimateTextWidth(badge, 24) + 36
    if (ctx) {
      drawRoundRect(ctx, cursorX, y, width, 42, 21, colors[1])
      drawTextBlock(ctx, badge, cursorX + 18, y + 7, width - 36, { fontSize: 24, lineHeight: 30, color: colors[0] })
    }
    cursorX += width + 12
  })
  return y + 42
}

function drawInfoRow(ctx, label, value, x, y) {
  const labelWidth = 150
  const rowHeight = getInfoRowHeight(value)
  if (ctx) {
    ctx.setFillStyle('#f3f4f6')
    ctx.fillRect(x, y, CONTENT_WIDTH, 2)
    drawTextBlock(ctx, label, x, y + 20, labelWidth, { fontSize: 26, lineHeight: 40, color: '#92400e' })
    drawTextBlock(ctx, value, x + labelWidth, y + 20, CONTENT_WIDTH - labelWidth, { fontSize: 26, lineHeight: 40, color: '#374151' })
    ctx.fillRect(x, y + rowHeight - 2, CONTENT_WIDTH, 2)
  }
  return y + rowHeight
}

function getInfoRowHeight(value) {
  return Math.max(80, textBlockHeight(value, 26, 40, CONTENT_WIDTH - 150) + 40)
}

function drawTagColumns(ctx, item, x, y) {
  const gap = 20
  const columnWidth = (CONTENT_WIDTH - gap) / 2
  const height = getTagColumnsHeight(item)
  drawTagColumn(ctx, '优势', item.advantages, x, y, columnWidth, '#166534', '#dcfce7', height)
  drawTagColumn(ctx, '短板', item.weaknesses, x + columnWidth + gap, y, columnWidth, '#991b1b', '#fee2e2', height)
  return y + height
}

function getTagColumnsHeight(item) {
  const columnWidth = (CONTENT_WIDTH - 20) / 2
  const good = 60 + drawTags(null, item.advantages, 0, 0, columnWidth - 44, '#166534', '#dcfce7')
  const weak = 60 + drawTags(null, item.weaknesses, 0, 0, columnWidth - 44, '#991b1b', '#fee2e2')
  return Math.max(good, weak) + 44
}

function drawTagColumn(ctx, title, tags, x, y, width, color, background, height) {
  if (!ctx) return
  drawRoundRect(ctx, x, y, width, height, 24, '#f9fafb')
  drawTextBlock(ctx, title, x + 22, y + 22, width - 44, { fontSize: 28, lineHeight: 38, color: '#111827' })
  drawTags(ctx, tags, x + 22, y + 72, width - 44, color, background)
}

function drawStateColumns(ctx, item, x, y) {
  const items = [['压力状态', item.stressState], ['放松状态', item.relaxState]].filter(([, text]) => text)
  if (!items.length) return y
  const height = getStateColumnsHeight(item)
  const gap = items.length > 1 ? 20 : 0
  const columnWidth = (CONTENT_WIDTH - gap) / items.length
  items.forEach(([title, text], index) => drawTextColumn(ctx, title, text, x + index * (columnWidth + gap), y, columnWidth, height))
  return y + height
}

function getStateColumnsHeight(item) {
  const items = [item.stressState, item.relaxState].filter(Boolean)
  if (!items.length) return 0
  const columnWidth = (CONTENT_WIDTH - (items.length > 1 ? 20 : 0)) / items.length - 44
  return Math.max(...items.map(text => 76 + textBlockHeight(text, 26, 40, columnWidth))) + 22
}

function drawTextColumn(ctx, title, text, x, y, width, height) {
  if (!ctx) return
  drawRoundRect(ctx, x, y, width, height, 24, '#f9fafb')
  drawTextBlock(ctx, title, x + 22, y + 22, width - 44, { fontSize: 28, lineHeight: 38, color: '#111827' })
  drawTextBlock(ctx, text, x + 22, y + 72, width - 44, { fontSize: 26, lineHeight: 40, color: '#4b5563' })
}

function drawAdvice(ctx, item, x, y) {
  const height = getAdviceHeight(item)
  if (ctx) {
    drawRoundRect(ctx, x, y, CONTENT_WIDTH, height, 24, '#fff7ed')
    drawTextBlock(ctx, '成长建议', x + 24, y + 24, CONTENT_WIDTH - 48, { fontSize: 28, lineHeight: 38, color: '#111827' })
    drawTextBlock(ctx, item.growthAdvice, x + 24, y + 76, CONTENT_WIDTH - 48, { fontSize: 26, lineHeight: 40, color: '#4b5563' })
  }
  return y + height
}

function getAdviceHeight(item) {
  return 100 + textBlockHeight(item.growthAdvice, 26, 40, CONTENT_WIDTH - 48)
}

function drawDetails(ctx, item, x, y) {
  return reportDetails(item).reduce((cursorY, [label, value]) => {
    const height = 72 + textBlockHeight(value, 26, 40, CONTENT_WIDTH - 44)
    if (ctx) {
      drawRoundRect(ctx, x, cursorY, CONTENT_WIDTH, height, 24, '#f9fafb')
      drawTextBlock(ctx, label, x + 22, cursorY + 22, CONTENT_WIDTH - 44, { fontSize: 28, lineHeight: 38, color: '#111827' })
      drawTextBlock(ctx, value, x + 22, cursorY + 72, CONTENT_WIDTH - 44, { fontSize: 26, lineHeight: 40, color: '#4b5563' })
    }
    return cursorY + height + 2
  }, y)
}

function getDetailsHeight(item) {
  return reportDetails(item).reduce((total, [, value]) => {
    return total + 74 + textBlockHeight(value, 26, 40, CONTENT_WIDTH - 44)
  }, 0)
}

function reportDetails(item) {
  return [
    ['事业财富', item.career],
    ['亲密关系', item.relationship],
    ['身心健康', item.health]
  ].filter(([, value]) => value)
}

function drawBlindNote(ctx, item, x, y) {
  const height = getBlindNoteHeight(item)
  if (ctx) {
    drawRoundRect(ctx, x, y, CONTENT_WIDTH, height, 20, '#f3f4f6')
    drawTextBlock(ctx, `盲区提示：${item.blindSpotTip}`, x + 22, y + 18, CONTENT_WIDTH - 44, { fontSize: 24, lineHeight: 36, color: '#6b7280' })
  }
}

function getBlindNoteHeight(item) {
  return 36 + textBlockHeight(`盲区提示：${item.blindSpotTip}`, 24, 36, CONTENT_WIDTH - 44)
}

function drawFooter(ctx, y) {
  const height = 104
  if (ctx) {
    drawRoundRect(ctx, PAGE_PADDING, y, CARD_WIDTH, height, 52, '#f97316')
    drawTextBlock(ctx, '添加专业咨询微信，一对一解读完整深度分析', PAGE_PADDING + 52, y + 32, CARD_WIDTH - 104, { fontSize: 30, lineHeight: 42, color: '#ffffff' })
  }
  return y + height
}
