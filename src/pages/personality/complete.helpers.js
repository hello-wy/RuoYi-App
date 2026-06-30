const DIMENSION_NUMBERS = Object.freeze([1, 2, 3, 4, 5, 6, 7, 8, 9])
const COUNT_ROW_LABELS = Object.freeze(['是', '不确定', '否', '是/不确定'])
const RANK_ROW_LABELS = Object.freeze(['是', '否', '是/不确定'])
const ANSWER_LABELS = Object.freeze({
  1: '是',
  2: '不确定',
  0: '否'
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
