import request from '@/utils/request'

export function getWalletInfo() {
  return request({
    url: '/wxmini/wallet/info',
    method: 'get'
  })
}

export function applyWithdraw(amount) {
  return request({
    url: '/wxmini/wallet/withdraw',
    method: 'post',
    data: { amount: String(amount) }
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
