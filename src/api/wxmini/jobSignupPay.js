import request from '@/utils/request'

export function listMyJobSignupOrders() {
  return request({
    url: '/wxmini/pay/jobs/orders/my',
    method: 'get'
  })
}

export function createJobSignupOrder(data, options = {}) {
  return request({
    url: '/wxmini/pay/jobs/orders/create',
    method: 'post',
    data,
    ...options
  })
}

export function queryJobSignupOrder(orderNo) {
  return request({
    url: `/wxmini/pay/jobs/orders/${orderNo}`,
    method: 'get'
  })
}
