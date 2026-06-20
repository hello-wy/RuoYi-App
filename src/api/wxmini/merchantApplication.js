import request from '@/utils/request'
import upload from '@/utils/upload'

export function uploadMerchantLicense(filePath) {
  return upload({
    url: '/wxmini/common/uploadMerchantLicense',
    filePath,
    name: 'file',
    showError: false,
  })
}

export function submitMerchantApplication(data) {
  return request({
    url: '/wxmini/profile/merchant-user-type-application',
    method: 'post',
    data,
  })
}
