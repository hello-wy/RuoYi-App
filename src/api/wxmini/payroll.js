import request from '@/utils/request'

export function createPayrollOrder(data) {
  return request({
    url: '/wxmini/pay/payroll/orders/create',
    method: 'post',
    data
  })
}

export function getPayrollOrder(orderNo) {
  return request({
    url: `/wxmini/pay/payroll/orders/${orderNo}`,
    method: 'get'
  })
}
