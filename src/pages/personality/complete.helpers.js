const DIMENSION_NUMBERS = Object.freeze([1, 2, 3, 4, 5, 6, 7, 8, 9])
const COUNT_ROW_LABELS = Object.freeze(['是', '不确定', '否', '是/不确定'])
const RANK_ROW_LABELS = Object.freeze(['是', '否', '是/不确定'])
const ANSWER_LABELS = Object.freeze({
  1: '是',
  2: '不确定',
  0: '否'
})

const TYPE_NAMES = Object.freeze({
  1: '改革者',
  2: '助人者',
  3: '成就者',
  4: '自我型',
  5: '理智型',
  6: '忠诚者',
  7: '活跃型',
  8: '领袖型',
  9: '和平者'
})

const TYPE_FALLBACKS = Object.freeze({
  1: { fear: '害怕犯错或不够好', desire: '渴望正确、有原则', intro: '原则感强，追求把事做好', advantages: ['自律', '负责', '有标准'], weaknesses: ['挑剔', '紧绷'], stress: '压力下容易更急于纠错，难以放松。', relax: '放松时更能接纳差异，表达温和。', advice: '先允许事情达到可用，再逐步优化。' },
  2: { fear: '害怕不被需要', desire: '渴望被爱与被认可', intro: '温暖支持，善于照顾他人', advantages: ['共情', '热心', '支持力'], weaknesses: ['讨好', '忽略自己'], stress: '压力下容易过度付出并期待回应。', relax: '放松时更能照顾自己，也尊重边界。', advice: '每天为自己保留一个明确需求。' },
  3: { fear: '害怕失败或没有价值', desire: '渴望被肯定与有成就', intro: '目标清晰，行动力强', advantages: ['高效', '进取', '结果感'], weaknesses: ['急躁', '怕失败'], stress: '压力下容易用忙碌证明自己，忽略感受。', relax: '放松时能卸下表现，回到真实需要。', advice: '把真实感受也列入复盘指标。' },
  4: { fear: '害怕平凡或没有独特性', desire: '渴望真实与被理解', intro: '感受细腻，重视真实表达', advantages: ['敏感', '创造力', '真诚'], weaknesses: ['情绪化', '比较'], stress: '压力下容易陷入自我否定或情绪波动。', relax: '放松时更稳定，也更愿意行动。', advice: '用一个小行动承接当下情绪。' },
  5: { fear: '害怕无能或被消耗', desire: '渴望理解世界并保持自主', intro: '理性专注，喜欢深入思考', advantages: ['洞察', '专注', '独立'], weaknesses: ['疏离', '过度分析'], stress: '压力下容易退回头脑，减少连接。', relax: '放松时更愿意分享资源与感受。', advice: '把一个想法转化成可见行动。' },
  6: { fear: '害怕失去安全感', desire: '渴望稳定、可信赖', intro: '谨慎可靠，善于预判风险', advantages: ['忠诚', '稳妥', '责任心'], weaknesses: ['担忧', '犹豫'], stress: '压力下容易反复确认，放大风险。', relax: '放松时更相信自己，也更果断。', advice: '区分真实风险和想象风险。' },
  7: { fear: '害怕受限或痛苦', desire: '渴望自由与丰富体验', intro: '乐观灵活，善于打开可能', advantages: ['乐观', '灵活', '创造'], weaknesses: ['分散', '逃避沉闷'], stress: '压力下容易寻找新刺激来逃开不适。', relax: '放松时更能专注完成，也接纳平淡。', advice: '先完成一个重点，再开启新选择。' },
  8: { fear: '害怕被控制或软弱', desire: '渴望掌控与保护重要的人', intro: '直接有力，敢于承担', advantages: ['果断', '担当', '保护力'], weaknesses: ['强势', '不示弱'], stress: '压力下容易用控制感对抗不安。', relax: '放松时更能展现柔软与信任。', advice: '表达需求前，先降低语气强度。' },
  9: { fear: '害怕冲突与分离', desire: '渴望和谐与内在平静', intro: '温和包容，擅长稳定氛围', advantages: ['包容', '稳定', '协调'], weaknesses: ['拖延', '回避冲突'], stress: '压力下容易压下想法，选择拖延。', relax: '放松时更能清晰表达自己的立场。', advice: '每天先完成一件自己的优先事项。' }
})

export function buildPersonalityResultTables(result = {}) {
  const counters = createDimensionCounters()
  const answers = resolveAnswers(result)
  let recognizedCount = 0

  answers.forEach(answer => {
    const dimensionNo = normalizeDimensionNo(answer)
    const answerLabel = normalizeAnswerLabel(answer)
    if (!counters[dimensionNo] || !answerLabel) return
    recognizedCount += 1
    counters[dimensionNo][answerLabel] += 1
  })

  return {
    dimensions: DIMENSION_NUMBERS,
    countRows: buildCountRows(counters),
    rankRows: buildRankRows(counters),
    hasRows: recognizedCount > 0
  }
}

export function normalizePersonalityReportResult(result = {}) {
  const scores = normalizeScores(result)
  const reports = normalizeReports(result, scores)

  return {
    scores,
    reports,
    hasReports: reports.length > 0
  }
}

function createDimensionCounters() {
  return DIMENSION_NUMBERS.reduce((map, dimensionNo) => {
    map[dimensionNo] = { 是: 0, 不确定: 0, 否: 0 }
    return map
  }, {})
}

function resolveAnswers(result) {
  const candidates = [result.answers, result.records, result.rows, result.details, result.items]
  return candidates.find(Array.isArray) || []
}

function normalizeDimensionNo(answer) {
  const rawValue = answer.dimension_no ?? answer.dimensionNo ?? answer.dimension
  const dimensionNo = Number(rawValue)
  return DIMENSION_NUMBERS.includes(dimensionNo) ? dimensionNo : null
}

function normalizeAnswerLabel(answer) {
  const rawLabel = answer.answer_label ?? answer.answerLabel ?? answer.label
  if (COUNT_ROW_LABELS.includes(rawLabel)) return rawLabel

  const rawValue = answer.answer_value ?? answer.answerValue ?? answer.value
  return ANSWER_LABELS[rawValue] || null
}

function buildCountRows(counters) {
  return COUNT_ROW_LABELS.map(label => ({
    label,
    values: DIMENSION_NUMBERS.map(dimensionNo => resolveCount(counters[dimensionNo], label))
  }))
}

function resolveCount(counter, label) {
  if (label === '是/不确定') {
    return counter['是'] + counter['不确定']
  }
  return counter[label]
}

function buildRankRows(counters) {
  return RANK_ROW_LABELS.map(label => ({
    label,
    values: [...DIMENSION_NUMBERS].sort((left, right) => {
      const diff = resolveCount(counters[right], label) - resolveCount(counters[left], label)
      return diff || left - right
    })
  }))
}

function normalizeScores(result) {
  const explicitScores = [result.scores, result.scoreList, result.dimensionScores].find(Array.isArray)
  if (explicitScores) {
    return DIMENSION_NUMBERS.map(type => {
      const matched = explicitScores.find(item => Number(item.type ?? item.dimension ?? item.dimensionNo ?? item.dimension_no) === type)
      return { type, score: toNumber(matched?.score ?? matched?.value ?? matched?.count) }
    })
  }

  const yesRow = buildPersonalityResultTables(result).countRows.find(row => row.label === '是/不确定')
  return DIMENSION_NUMBERS.map((type, index) => ({
    type,
    score: yesRow?.values?.[index] || 0
  }))
}

function normalizeReports(result, scores) {
  const sourceReports = [result.reports, result.reportItems, result.items].find(items => {
    return Array.isArray(items) && items.some(item => item && (item.coreSummary || item.core_summary || item.name || item.typeName || item.type_name))
  })

  if (sourceReports) {
    return sourceReports.map(report => normalizeReportItem(report)).filter(Boolean)
  }

  const bestScore = [...scores].sort((left, right) => right.score - left.score || left.type - right.type)[0]
  return bestScore?.score > 0 ? [normalizeReportItem({ type: bestScore.type })] : []
}

function normalizeReportItem(report) {
  const type = normalizeReportType(report)
  if (!type) return null

  const fallback = TYPE_FALLBACKS[type]
  const name = pickString(report.name, report.typeName, report.type_name) || TYPE_NAMES[type]
  const weaknesses = toList(report.weaknesses ?? report.disadvantages ?? report.shortcomings, fallback.weaknesses)

  return {
    type,
    name,
    title: pickString(report.coreSummary, report.core_summary, report.summary) || `${type}号${name} 常态平衡型`,
    coreFear: pickString(report.coreFear, report.core_fear, report.fear) || fallback.fear,
    coreDesire: pickString(report.coreDesire, report.core_desire, report.desire) || fallback.desire,
    intro: limitText(pickString(report.intro, report.shortIntro, report.short_intro, report.description) || fallback.intro, 50),
    advantages: toList(report.advantages ?? report.strengths, fallback.advantages).slice(0, 3),
    weaknesses: weaknesses.slice(0, 3),
    stressState: pickString(report.stressState, report.stress_state, report.stress) || fallback.stress,
    relaxState: pickString(report.relaxState, report.relax_state, report.relax) || fallback.relax,
    growthAdvice: pickString(report.growthAdvice, report.growth_advice, report.growth, report.advice) || fallback.advice,
    blindSpotTip: pickString(report.blindSpotTip, report.blind_spot_tip) || `留意“${weaknesses[0] || '惯性反应'}”带来的判断盲区。`
  }
}

function normalizeReportType(report) {
  const rawType = report.type ?? report.personalityType ?? report.personality_type ?? report.dimension ?? report.dimensionNo ?? report.dimension_no ?? report.name ?? report.typeName ?? report.type_name ?? report.coreSummary ?? report.core_summary
  const type = Number(String(rawType || '').match(/\d+/)?.[0])
  return DIMENSION_NUMBERS.includes(type) ? type : null
}

function toNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function pickString(...values) {
  const value = values.find(item => typeof item === 'string' && item.trim())
  return value ? value.trim() : ''
}

function toList(value, fallback = []) {
  if (Array.isArray(value)) {
    return value.map(item => String(item || '').trim()).filter(Boolean)
  }
  if (typeof value === 'string' && value.trim()) {
    return value.split(/[、,，;；\n]/).map(item => item.trim()).filter(Boolean)
  }
  return [...fallback]
}

function limitText(text, maxLength) {
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text
}
