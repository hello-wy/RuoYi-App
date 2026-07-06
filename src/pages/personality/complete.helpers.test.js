import { describe, expect, test } from 'vitest'
import { buildPersonalityResultTables, normalizePersonalityReportResult } from './complete.helpers'

describe('personality complete helpers', () => {
  test('counts answers by dimension and sorts dimensions by answer count', () => {
    const answers = [
      ...Array.from({ length: 20 }, () => ({ dimension_no: 1, answer_label: '否' })),
      ...Array.from({ length: 19 }, () => ({ dimension_no: 5, answer_label: '否' })),
      { dimension_no: 5, answer_label: '不确定' },
      ...Array.from({ length: 19 }, () => ({ dimension_no: 7, answer_label: '否' })),
      { dimension_no: 7, answer_label: '是' },
      ...Array.from({ length: 19 }, () => ({ dimension_no: 8, answer_label: '否' })),
      { dimension_no: 8, answer_label: '是' },
      ...Array.from({ length: 20 }, () => ({ dimension_no: 9, answer_label: '否' }))
    ]

    const tables = buildPersonalityResultTables({ answers })

    expect(tables.countRows).toEqual([
      { label: '是', values: [0, 0, 0, 0, 0, 0, 1, 1, 0] },
      { label: '不确定', values: [0, 0, 0, 0, 1, 0, 0, 0, 0] },
      { label: '否', values: [20, 0, 0, 0, 19, 0, 19, 19, 20] },
      { label: '是/不确定', values: [0, 0, 0, 0, 1, 0, 1, 1, 0] }
    ])
    expect(tables.rankRows).toEqual([
      { label: '是', values: [7, 8, 1, 2, 3, 4, 5, 6, 9] },
      { label: '否', values: [1, 9, 5, 7, 8, 2, 3, 4, 6] },
      { label: '是/不确定', values: [5, 7, 8, 1, 2, 3, 4, 6, 9] }
    ])
  })

  test('reads common backend field names and numeric answer values', () => {
    const tables = buildPersonalityResultTables({
      records: [
        { dimensionNo: '2', answerValue: 1 },
        { dimensionNo: '2', answerValue: 2 },
        { dimensionNo: '3', answer_value: 0 }
      ]
    })

    expect(tables.countRows[0].values[1]).toBe(1)
    expect(tables.countRows[1].values[1]).toBe(1)
    expect(tables.countRows[2].values[2]).toBe(1)
    expect(tables.hasRows).toBe(true)
  })

  test('normalizes report fields defensively', () => {
    const report = normalizePersonalityReportResult({
      scores: [{ type: 3, score: 18 }, { dimensionNo: 2, value: 12 }],
      reports: [
        {
          type: 3,
          name: '成就者',
          coreSummary: '3号成就者 侧翼3w2｜常态平衡型',
          coreFear: '害怕失败',
          coreDesire: '渴望被肯定',
          intro: '目标清晰，行动力强，能快速推进结果',
          advantages: '高效、进取、结果感',
          weaknesses: ['急躁', '怕失败'],
          stressState: '压力下容易用忙碌证明自己。',
          relaxState: '放松时更能回到真实需要。',
          growthAdvice: '把真实感受也列入复盘指标。'
        }
      ]
    })

    expect(report.scores[2]).toEqual({ type: 3, score: 18 })
    expect(report.reports[0].title).toBe('3号成就者 侧翼3w2｜常态平衡型')
    expect(report.reports[0].advantages).toEqual(['高效', '进取', '结果感'])
    expect(report.reports[0].blindSpotTip).toContain('急躁')
  })

  test('derives fallback report from old answer result when report fields are absent', () => {
    const report = normalizePersonalityReportResult({
      answers: [
        { dimension_no: 8, answer_label: '是' },
        { dimension_no: 8, answer_label: '不确定' },
        { dimension_no: 1, answer_label: '是' }
      ]
    })

    expect(report.scores[7]).toEqual({ type: 8, score: 2 })
    expect(report.hasReports).toBe(true)
    expect(report.reports[0].type).toBe(8)
    expect(report.reports[0].coreFear).toBeTruthy()
  })
})
