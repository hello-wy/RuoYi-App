export function getSubmitText({ submitting, hasOrderNo, readonly = false }) {
  if (readonly) return ''
  if (submitting) return '处理中...'
  return hasOrderNo ? '生成新订单支付' : '支付'
}

export function isCoursePackageDetailMode(options = {}) {
  return Boolean(trimText(options.orderNo))
}

export function buildCreatedOrderPreview(currentOrder = {}, createdOrder = {}) {
  if (!createdOrder.orderNo) return currentOrder
  return {
    ...currentOrder,
    ...createdOrder
  }
}

export function buildPaidTutoringPackageOrderCenterUrl(orderNo) {
  const id = trimText(orderNo)
  if (!id) {
    throw new Error('支付成功后缺少家教课时包订单号')
  }
  return `/pages/mine/order-center/index?type=tutoringPackage&status=paid&orderNo=${encodeURIComponent(id)}`
}

export function buildServiceTimes(timeSlots = []) {
  const slots = Array.isArray(timeSlots) ? timeSlots : []
  return slots.flatMap(item => {
    const startTime = trimText(item?.startTime)
    const endTime = trimText(item?.endTime)
    const dates = Array.isArray(item?.serviceDates) ? item.serviceDates : []
    return dates
      .map(trimText)
      .filter(Boolean)
      .sort()
      .map(serviceDate => ({ serviceDate, startTime, endTime }))
      .filter(item => item.startTime && item.endTime)
  })
}

function trimText(value) {
  return String(value || '').trim()
}
