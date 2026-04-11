import request from '@/utils/request'

/**
 * 获取当前用户钱包信息（余额、冻结、累计收入/提现）
 */
export function getWalletInfo() {
  return request({
    url: '/system/wallet/info',
    method: 'get'
  })
}

/**
 * 申请提现到微信钱包
 * @param {string|number} amount 提现金额
 */
export function applyWithdraw(amount) {
  return request({
    url: '/system/wallet/withdraw',
    method: 'post',
    data: { amount: String(amount) }
  })
}

/**
 * 获取提现记录列表
 */
export function getWithdrawRecords() {
  return request({
    url: '/system/wallet/withdrawRecords',
    method: 'get'
  })
}
