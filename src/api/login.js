import request from '@/utils/request'

function buildWxminiLoginParams(appid, code, phoneCode = '', inviteCode = '') {
  const params = { appid, code }
  if (phoneCode) {
    params.phoneCode = phoneCode
  }
  if (inviteCode) {
    params.inviteCode = inviteCode
  }
  return params
}

// 登录方法
export function login(username, password, code, uuid) {
  const data = {
    username,
    password,
    code,
    uuid
  }
  return request({
    'url': '/login',
    headers: {
      isToken: false
    },
    'method': 'post',
    'data': data
  })
}

// 注册方法
export function register(data) {
  return request({
    url: '/register',
    headers: {
      isToken: false
    },
    method: 'post',
    data: data
  })
}

// 获取用户详细信息
export function getInfo() {
  return request({
    'url': '/getInfo',
    'method': 'get'
  })
}

// 退出方法
export function logout() {
  return request({
    'url': '/logout',
    'method': 'post'
  })
}

// 获取验证码
export function getCodeImg() {
  return request({
    'url': '/captchaImage',
    headers: {
      isToken: false
    },
    method: 'get',
    timeout: 20000
  })
}

// 微信小程序登录，未注册时可携带 phoneCode 完成手机号快捷注册
export function wxminiLogin(appid, code, phoneCode = '', inviteCode = '') {
  return request({
    url: '/wxmini/login',
    headers: {
      isToken: false
    },
    method: 'get',
    params: buildWxminiLoginParams(appid, code, phoneCode, inviteCode)
  })
}
