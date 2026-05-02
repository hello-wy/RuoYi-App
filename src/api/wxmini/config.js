import request from '@/utils/request'

export function getParttimeGroupQrcode() {
  return request({
    url: '/wxmini/config/parttime-group-qrcode',
    method: 'get'
  })
}

export function getMerchantAgentConfig() {
  return request({
    url: '/wxmini/config/merchant-agent',
    method: 'get'
  })
}
