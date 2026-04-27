const MAX_UPLOAD_IMAGE_SIZE = 5 * 1024 * 1024
const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png']

function getFileExtension(path = '') {
  const segments = String(path).split('.')
  return segments.length > 1 ? segments.pop().toLowerCase() : ''
}

export function getImageValidationError(file = {}) {
  const filePath = file.path || file.tempFilePath || ''
  const extension = getFileExtension(filePath)
  if (!ALLOWED_IMAGE_EXTENSIONS.includes(extension)) {
    return '仅支持 JPG、JPEG、PNG 格式图片'
  }

  if (Number(file.size || 0) > MAX_UPLOAD_IMAGE_SIZE) {
    return '图片大小不能超过 5MB'
  }

  return ''
}

export function removeAreaCodeAtIndex(areaCodes = [], index) {
  return areaCodes.filter((_, currentIndex) => currentIndex !== index)
}

export function buildUploadedCertificateUrl(baseUrl = '', result = {}) {
  if (result.fileName) {
    return result.fileName
  }

  if (result.url) {
    return result.url
  }

  return ''
}

export function buildRemovedCertificateState() {
  return {
    certificates: '',
    certificatePreviewUrl: ''
  }
}

export function normalizeSelectedImage(file = {}) {
  return {
    ...file,
    path: file.path || file.tempFilePath || '',
    tempFilePath: file.tempFilePath || file.path || '',
    size: Number(file.size || 0)
  }
}

export function isChooseImageCanceled(errMsg = '') {
  const normalized = String(errMsg).toLowerCase()
  return normalized.includes('cancel') || normalized.includes('用户取消')
}

export function isChooseImagePermissionDenied(error = {}) {
  const errMsg = String(error?.errMsg || error?.message || '').toLowerCase()
  const errCode = error?.errCode

  return errCode === 1101005 ||
    errMsg.includes('auth deny') ||
    errMsg.includes('permission denied') ||
    errMsg.includes('authorize:fail') ||
    errMsg.includes('无权限') ||
    errMsg.includes('未授权')
}

export function requestWechatImagePrivacyAuthorization(wxApi = globalThis.wx) {
  if (!wxApi?.requirePrivacyAuthorize) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    wxApi.requirePrivacyAuthorize({
      success: () => resolve(),
      fail: (error) => reject(error)
    })
  })
}

export function chooseWechatAlbumImage(uniApi = globalThis.uni) {
  const hasChooseMedia = typeof uniApi?.chooseMedia === 'function'
  const hasChooseImage = typeof uniApi?.chooseImage === 'function'

  if (!hasChooseMedia && !hasChooseImage) {
    return Promise.reject(new Error('choose image api unavailable'))
  }

  const options = {
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album']
  }

  if (hasChooseMedia) {
    options.mediaType = ['image']
  }

  return new Promise((resolve, reject) => {
    const invoke = hasChooseMedia ? uniApi.chooseMedia : uniApi.chooseImage

    invoke({
      ...options,
      success: (res) => {
        const file = normalizeSelectedImage(res.tempFiles?.[0] || {
          path: res.tempFilePaths?.[0] || '',
          tempFilePath: res.tempFilePaths?.[0] || '',
          size: 0
        })
        resolve(file)
      },
      fail: (error) => reject(error)
    })
  })
}
