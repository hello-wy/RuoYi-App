import request from '@/utils/request'

export function listJobRefundOrders(query) {
  return request({
    url: '/system/refund/job/list',
    method: 'get',
    params: query
  })
}

export function refundJobOrder(orderNo) {
  return request({
    url: '/system/refund/job/' + orderNo,
    method: 'post'
  })
}

export function listSalonRefundOrders(query) {
  return request({
    url: '/system/refund/salon/list',
    method: 'get',
    params: query
  })
}

export function refundSalonOrder(orderNo) {
  return request({
    url: '/system/refund/salon/' + orderNo,
    method: 'post'
  })
}
