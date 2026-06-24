import request from '@/utils/request'

export function listJobRefundOrders(query) {
  return request({
    url: '/system/refund/job/list',
    adminAuth: true,
    method: 'get',
    params: query
  })
}

export function refundJobOrder(orderNo) {
  return request({
    url: '/system/refund/job/' + orderNo,
    adminAuth: true,
    method: 'post'
  })
}

export function listSalonRefundOrders(query) {
  return request({
    url: '/system/refund/salon/list',
    adminAuth: true,
    method: 'get',
    params: query
  })
}

export function refundSalonOrder(orderNo) {
  return request({
    url: '/system/refund/salon/' + orderNo,
    adminAuth: true,
    method: 'post'
  })
}

export function listCourseRefundOrders(query) {
  return request({
    url: '/system/refund/course/list',
    adminAuth: true,
    method: 'get',
    params: query
  })
}

export function refundCourseOrder(orderNo) {
  return request({
    url: '/system/refund/course/' + orderNo,
    adminAuth: true,
    method: 'post'
  })
}
