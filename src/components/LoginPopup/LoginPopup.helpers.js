import { hasUserType, normalizeUserType } from '@/utils/userType'
import { isAdminUser } from '@/utils/admin'

const EMPTY_LOGIN_FORM = Object.freeze({
  username: '',
  password: '',
  code: '',
  uuid: ''
})

const DEV_LOGIN_FORM = Object.freeze({
  username: 'admin',
  password: 'admin123'
})

export function createLoginForm({ isDev, initialLoginForm = {} } = {}) {
  return {
    ...EMPTY_LOGIN_FORM,
    ...(isDev ? DEV_LOGIN_FORM : {}),
    ...initialLoginForm
  }
}

export function resolveLoginSuccessUrl({
  payload = null,
  token = '',
  roles = [],
  userType = '',
  fallbackUrl = '',
  guideUrl = '/pages/guide/index',
  adminUrl = '/pages/mine/admin/index'
} = {}) {
  if (isAdminUser(token, roles)) {
    return adminUrl
  }

  const loginUserType = payload && Object.prototype.hasOwnProperty.call(payload, 'userType')
    ? payload.userType
    : userType

  if (!hasUserType(normalizeUserType(loginUserType))) {
    return guideUrl
  }
  return fallbackUrl
}

export function shouldRequestPhoneCode({
  phoneAuthorizationPending = false,
  realtimePhoneSupported = false
} = {}) {
  return Boolean(phoneAuthorizationPending && realtimePhoneSupported)
}
