import request from '@/utils/request'

function unwrap(response) {
  return response?.data ?? response ?? {}
}

function number(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function normalizeDistributionSummary(response) {
  const data = unwrap(response)
  return {
    level1Amount: number(data.level1Amount),
    level2Amount: number(data.level2Amount),
    reversedAmount: number(data.reversedAmount),
    manualCreditAmount: number(data.manualCreditAmount),
    manualDebitAmount: number(data.manualDebitAmount)
  }
}

export function normalizeDistributionRecords(response) {
  const data = unwrap(response)
  return {
    rows: Array.isArray(response?.rows) ? response.rows : (Array.isArray(data.rows) ? data.rows : []),
    total: number(response?.total ?? data.total)
  }
}

export function getDistributionCommissionConfig() {
  return request({ url: '/system/course-distribution-commission/config', adminAuth: true, method: 'get' }).then(unwrap)
}

export function updateDistributionCommissionConfig(data) {
  return request({ url: '/system/course-distribution-commission/config', adminAuth: true, method: 'put', data }).then(unwrap)
}

export function getDistributionCommissionSummary() {
  return request({ url: '/system/course-distribution-commission/summary', adminAuth: true, method: 'get' }).then(normalizeDistributionSummary)
}

export function listDistributionCommissionRecords(params) {
  return request({ url: '/system/course-distribution-commission/records', adminAuth: true, method: 'get', params }).then(normalizeDistributionRecords)
}

export function createDistributionManualRecord(data) {
  return request({ url: '/system/course-distribution-commission/manual-records', adminAuth: true, method: 'post', data }).then(unwrap)
}
