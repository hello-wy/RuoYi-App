import { describe, expect, test } from 'vitest'
import { buildExportablePersonalityReport, estimateReportImageHeight } from './reportExport.helpers'

describe('personality report export helpers', () => {
  test('keeps export drawable when report data is empty', () => {
    const report = buildExportablePersonalityReport({ reports: [], reportCount: 0, hasReports: false })

    expect(report.hasReports).toBe(false)
    expect(report.reports).toHaveLength(0)
    expect(report.emptyCard.title).toBe('报告生成中')
    expect(estimateReportImageHeight(report)).toBeGreaterThan(0)
  })
})
