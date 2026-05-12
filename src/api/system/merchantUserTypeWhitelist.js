import request from '@/utils/request'

export function addMerchantUserTypeWhitelist(data) {
  return request({
    url: '/system/merchant-user-type-whitelist',
    method: 'post',
    data,
  })
}

export function listMerchantUserTypeWhitelist(query) {
  return request({
    url: '/system/merchant-user-type-whitelist/list',
    method: 'get',
    params: query,
  })
}

export function deleteMerchantUserTypeWhitelist(ids) {
  return request({
    url: `/system/merchant-user-type-whitelist/${ids}`,
    method: 'delete',
  })
}
