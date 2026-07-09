export function textLines(text, fontSize, maxWidth) {
  const value = String(text || '')
  if (!value) return []
  const lines = []
  value.split('\n').forEach(paragraph => {
    let line = ''
    Array.from(paragraph).forEach(char => {
      const nextLine = line + char
      if (line && estimateTextWidth(nextLine, fontSize) > maxWidth) {
        lines.push(line)
        line = char
        return
      }
      line = nextLine
    })
    if (line) lines.push(line)
  })
  return lines
}

export function estimateTextWidth(text, fontSize) {
  return Array.from(String(text || '')).reduce((width, char) => {
    return width + (/^[\x00-\xff]$/.test(char) ? fontSize * 0.56 : fontSize)
  }, 0)
}

export function textBlockHeight(text, fontSize, lineHeight, maxWidth) {
  return textLines(text, fontSize, maxWidth).length * lineHeight
}

export function drawRoundRect(ctx, x, y, width, height, radius, color) {
  ctx.setFillStyle(color)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
  ctx.fill()
}

export function drawTextBlock(ctx, text, x, y, maxWidth, options = {}) {
  const fontSize = options.fontSize || 28
  const lineHeight = options.lineHeight || fontSize * 1.5
  const lines = textLines(text, fontSize, maxWidth)
  if (ctx) {
    ctx.setFillStyle(options.color || '#111827')
    ctx.setFontSize(fontSize)
    if (ctx.setTextBaseline) ctx.setTextBaseline('top')
    lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight))
  }
  return lines.length * lineHeight
}

export function drawTags(ctx, tags = [], x, y, maxWidth, color, background) {
  let cursorX = x
  let cursorY = y
  const height = 42
  const gap = 12
  tags.forEach(tag => {
    const width = Math.min(estimateTextWidth(tag, 24) + 28, maxWidth)
    if (cursorX > x && cursorX + width > x + maxWidth) {
      cursorX = x
      cursorY += height + gap
    }
    if (ctx) {
      drawRoundRect(ctx, cursorX, cursorY, width, height, 21, background)
      drawTextBlock(ctx, tag, cursorX + 14, cursorY + 6, width - 28, { fontSize: 24, lineHeight: 30, color })
    }
    cursorX += width + gap
  })
  return tags.length ? cursorY + height - y : 0
}
