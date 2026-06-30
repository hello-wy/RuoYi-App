import { describe, expect, test } from 'vitest'
import { buildPersonalityResultTables } from './complete.helpers'

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
})
