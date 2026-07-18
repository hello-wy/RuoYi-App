import request from '@/utils/request'

function unwrap(response) {
  return response?.data ?? response ?? {}
}

function number(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function normalizeSummary(response) {
  const data = unwrap(response)
  return {
    paymentCount: number(data.paymentCount),
    paidAmount: number(data.paidAmount),
    courseTotalAmount: number(data.courseTotalAmount),
    outstandingAmount: number(data.outstandingAmount),
    refundedAmount: number(data.refundedAmount),
    grossCashbackAmount: number(data.grossCashbackAmount),
    reversedCashbackAmount: number(data.reversedCashbackAmount),
    deductedCashbackAmount: number(data.deductedCashbackAmount),
    availableCashbackAmount: number(data.availableCashbackAmount),
    unattributedPaidAmount: number(data.unattributedPaidAmount)
  }
}

export function normalizePayment(payment = {}) {
  return {
    ...payment,
    courseTotalAmount: number(payment.courseTotalAmount ?? payment.courseTotal),
    grossCashbackAmount: number(payment.grossCashbackAmount ?? payment.grossCashback)
  }
}

export function normalizeList(response) {
  const data = unwrap(response)
  const rows = Array.isArray(response?.rows) ? response.rows : (Array.isArray(data.rows) ? data.rows : [])
  return {
    rows: rows.map(normalizePayment),
    total: number(response?.total ?? data.total)
  }
}

export function normalizePaymentDetail(response) {
  const data = unwrap(response)
  return {
    payment: data.payment ? normalizePayment(data.payment) : null,
    deductions: Array.isArray(data.deductions) ? data.deductions : []
  }
}

export function getCourseFinanceSummary() {
  return request({ url: '/system/course-finance/summary', adminAuth: true, method: 'get' })
    .then(normalizeSummary)
}

export function listCourseFinancePayments(query) {
  return request({
    url: '/system/course-finance/payments/list',
    adminAuth: true,
    method: 'get',
    params: query
  }).then(normalizeList)
}

export function getCourseFinancePayment(orderNo) {
  return request({
    url: `/system/course-finance/payments/${encodeURIComponent(orderNo)}`,
    adminAuth: true,
    method: 'get'
  }).then(normalizePaymentDetail)
}

export function getCourseFinanceConfig() {
  return request({ url: '/system/course-finance/config', adminAuth: true, method: 'get' }).then(unwrap)
}

export function updateCourseFinanceConfig(cashbackRatio) {
  return request({
    url: '/system/course-finance/config',
    adminAuth: true,
    method: 'put',
    data: { cashbackRatio }
  }).then(unwrap)
}

export function createCourseFinanceDeduction(data) {
  return request({
    url: '/system/course-finance/deductions',
    adminAuth: true,
    method: 'post',
    data
  }).then(unwrap)
}

export function listCourseFinanceManualRecords(query) {
  return request({
    url: '/system/course-finance/manual-records',
    adminAuth: true,
    method: 'get',
    params: query
  }).then(normalizeList)
}

export function createCourseFinanceManualRecord(data) {
  return request({
    url: '/system/course-finance/manual-records',
    adminAuth: true,
    method: 'post',
    data
  }).then(unwrap)
}
