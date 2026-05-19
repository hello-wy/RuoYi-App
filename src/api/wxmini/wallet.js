import request from '@/utils/request'

export function getWalletInfo() {
  return request({
    url: '/wxmini/wallet/info',
    method: 'get'
  })
}

/**
 * 提现申请 — 返回完整响应对象 { code, msg, data }，不触发全局 toast。
 * 页面层自行处理三态（成功/处理中/失败）。
 */
export function applyWithdraw(amount) {
  return request({
    url: '/wxmini/wallet/withdraw',
    method: 'post',
    data: { amount: String(amount) },
    showError: false
  }).catch(err => {
    // request 工具对 code !== 200 会 reject，这里捕获并返回完整响应对象给调用方
    return {
      code: err.code || 500,
      msg: err.msg || '提交失败，请重试',
      data: err.data || null
    }
  })
}

export function getWithdrawRecords() {
  return request({
    url: '/wxmini/wallet/withdraw-records',
    method: 'get'
  })
}

export function getWalletTransactions() {
  return request({
    url: '/wxmini/wallet/transactions',
    method: 'get'
  })
}
