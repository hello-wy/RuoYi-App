import request from '@/utils/request'

export function listMySalonOrders() {
  return request({
    url: '/wxmini/pay/salon/orders/my',
    method: 'get'
  })
}

export function createSalonPayOrder(data) {
  return request({
    url: '/wxmini/pay/salon/orders/create',
    method: 'post',
    data
  })
}

export function querySalonPayOrder(orderNo) {
  return request({
    url: `/wxmini/pay/salon/orders/${orderNo}`,
    method: 'get'
  })
}
