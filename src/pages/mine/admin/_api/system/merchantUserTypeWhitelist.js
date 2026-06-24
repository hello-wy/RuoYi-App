import request from '@/utils/request'

export function addMerchantUserTypeWhitelist(data) {
  return request({
    url: '/system/merchant-user-type-whitelist',
    adminAuth: true,
    method: 'post',
    data,
  })
}

export function listMerchantUserTypeWhitelist(query) {
  return request({
    url: '/system/merchant-user-type-whitelist/list',
    adminAuth: true,
    method: 'get',
    params: query,
  })
}

export function deleteMerchantUserTypeWhitelist(ids) {
  return request({
    url: `/system/merchant-user-type-whitelist/${ids}`,
    adminAuth: true,
    method: 'delete',
  })
}

export function auditMerchantUserTypeWhitelist(id, data) {
  return request({
    url: `/system/merchant-user-type-whitelist/${id}/audit`,
    adminAuth: true,
    method: 'put',
    data,
  })
}
