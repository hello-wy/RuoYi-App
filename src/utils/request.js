import config from '@/config'
import { getAdminToken, getToken } from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import { toast, showConfirm, tansParams } from '@/utils/common'

let timeout = 10000
const baseUrl = config.baseUrl

function joinRequestUrl(base = '', path = '') {
  const normalizedBase = String(base || '').replace(/\/+$/, '')
  const normalizedPath = String(path || '').replace(/^\/+/, '')
  return normalizedPath ? `${normalizedBase}/${normalizedPath}` : normalizedBase
}

function rejectWithMessage(reject, payload, fallback) {
  const message = typeof payload === 'string'
    ? payload
    : payload?.msg || payload?.message || payload?.errMsg || fallback

  reject({
    ...(typeof payload === 'object' && payload ? payload : {}),
    msg: message,
    errMsg: message
  })
}

function resolveAuthToken(config = {}) {
  const requestUrl = config.url || ''
  if (config.adminAuth === true) {
    return {
      header: 'Authorization',
      token: getAdminToken()
    }
  }
  return {
    header: requestUrl.startsWith('/wxmini') ? 'Wx-Authorization' : 'Authorization',
    token: getToken()
  }
}

const request = config => {
  // 是否需要设置 token
  const isToken = (config.headers || {}).isToken === false
  config.header = {
    ...(config.headers || {}),
    ...(config.header || {})
  }
  const auth = resolveAuthToken(config)
  if (auth.token && !isToken && !config.header[auth.header]) {
    config.header[auth.header] = 'Bearer ' + auth.token
  }
  // get请求映射params参数
  if (config.params) {
    let url = config.url + '?' + tansParams(config.params)
    url = url.slice(0, -1)
    config.url = url
  }
  return new Promise((resolve, reject) => {
    uni.request({
      method: config.method || 'get',
      timeout: config.timeout || timeout,
      url: config.baseUrl || joinRequestUrl(baseUrl, config.url),
      data: config.data,
      header: config.header,
      dataType: 'json'
    }).then(response => {
      const res = response
      const code = res.data.code || 200
      const msg = errorCode[code] || res.data.msg || errorCode['default']
      const shouldToastError = config.showError !== false
      if (code === 401) {
        showConfirm('登录状态已过期，您可以继续留在该页面，或者重新登录?').then(async res => {
          if (res.confirm) {
            const { useUserStore } = await import('@/store/modules/user')
            useUserStore().logOut().then(res => {
              uni.reLaunch({ url: '/pages/login' })
            })
          }
        })
        return rejectWithMessage(reject, { code, msg, data: res.data }, '无效的会话，或者会话已过期，请重新登录。')
      } else if (code === 500) {
        if (shouldToastError) {
          toast(msg)
        }
        return rejectWithMessage(reject, { code, msg, data: res.data }, errorCode['default'])
      } else if (code !== 200) {
        if (shouldToastError) {
          toast(msg)
        }
        return rejectWithMessage(reject, { code, msg, data: res.data }, errorCode['default'])
      }
      resolve(res.data)
    })
      .catch(error => {
        let { message } = error
        if (message === 'Network Error') {
          message = '后端接口连接异常'
        } else if (message.includes('timeout')) {
          message = '系统接口请求超时'
        } else if (message.includes('Request failed with status code')) {
          message = '系统接口' + message.slice(-3) + '异常'
        }
        toast(message)
        rejectWithMessage(reject, error, message)
      })
  })
}

export default request
