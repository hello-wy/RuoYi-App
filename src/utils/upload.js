import { useUserStore } from '@/store'
import config from '@/config'
import { getToken } from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import { toast, showConfirm, tansParams } from '@/utils/common'

let timeout = 10000
const baseUrl = config.baseUrl

function joinRequestUrl(base = '', path = '') {
  const normalizedBase = String(base || '').replace(/\/+$/, '')
  const normalizedPath = String(path || '').replace(/^\/+/, '')
  return normalizedPath ? `${normalizedBase}/${normalizedPath}` : normalizedBase
}

function parseUploadResponse(response = {}) {
  if (response.data && typeof response.data === 'object') {
    return response.data
  }

  const raw = String(response.data || '').trim()
  if (!raw) {
    return {
      code: 500,
      msg: '上传响应数据异常'
    }
  }

  try {
    return JSON.parse(raw)
  } catch {
    return {
      code: response.statusCode || 500,
      msg: raw
    }
  }
}

function resolveUploadErrorMessage(result = {}, fallback = errorCode['default']) {
  const code = Number(result.code || 0)
  const rawMessage = String(result.msg || '').trim()
  const normalizedMessage = rawMessage.toLowerCase()

  if (code === 413 || normalizedMessage.includes('request entity too large')) {
    return '文件过大，请上传不超过3MB的图片'
  }

  return rawMessage || errorCode[code] || fallback
}

function notifyUploadError(config = {}, message = '') {
  if (config.showError === false || !message) {
    return
  }
  toast(message)
}

function resolveTransportErrorMessage(error = {}) {
  let message = String(error?.errMsg || error?.message || '').trim()

  if (!message) {
    return '上传失败，请检查网络后重试'
  }
  if (message === 'Network Error') {
    return '后端接口连接异常'
  }
  if (message.includes('timeout')) {
    return '系统接口请求超时'
  }
  if (message.includes('Request failed with status code')) {
    return '系统接口' + message.substr(message.length - 3) + '异常'
  }
  return message
}

export default function upload(config) {
  const header = {
    ...(config.headers || {}),
    ...(config.header || {})
  }
  const isToken = header.isToken === false
  if (getToken() && !isToken) {
    const requestUrl = config.url || ''
    const authHeader = requestUrl.startsWith('/wxmini') ? 'Wx-Authorization' : 'Authorization'
    if (!header[authHeader]) {
      header[authHeader] = 'Bearer ' + getToken()
    }
  }
  config.header = header
  if (config.params) {
    let url = config.url + '?' + tansParams(config.params)
    url = url.slice(0, -1)
    config.url = url
  }
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      timeout: config.timeout || timeout,
      url: joinRequestUrl(baseUrl, config.url),
      filePath: config.filePath,
      name: config.name || 'file',
      header: config.header,
      formData: config.formData,
      success: (res) => {
        const result = parseUploadResponse(res)
        const code = result.code || 200
        const msg = resolveUploadErrorMessage(result)
        if (code === 200) {
          resolve(result)
        } else if (code == 401) {
          showConfirm('登录状态已过期，您可以继续留在该页面，或者重新登录?').then(res => {
            if (res.confirm) {
              useUserStore().logOut().then(res => {
                uni.reLaunch({ url: '/pages/login/login' })
              })
            }
          })
          notifyUploadError(config, msg)
          reject(msg)
        } else if (code === 500) {
          notifyUploadError(config, msg)
          reject(msg)
        } else if (code !== 200) {
          notifyUploadError(config, msg)
          reject(msg)
        }
      },
      fail: (error) => {
        const message = resolveTransportErrorMessage(error)
        notifyUploadError(config, message)
        reject(message)
      }
    })
  })
}


