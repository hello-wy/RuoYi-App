export {
  appendPreviewCacheBuster,
  buildUploadedCertificateUrl,
  buildUploadedPreviewUrl,
  chooseWechatAlbumImage,
  getImageValidationError,
  isChooseImageCanceled,
  isChooseImagePermissionDenied,
  normalizeSelectedImage,
  requestWechatImagePrivacyAuthorization
} from '@/pages/tutoring/_utils/imageUpload'

export function removeAreaCodeAtIndex(areaCodes = [], index) {
  return areaCodes.filter((_, currentIndex) => currentIndex !== index)
}

export function buildRemovedCertificateState() {
  return {
    certificates: '',
    certificatePreviewUrl: ''
  }
}
