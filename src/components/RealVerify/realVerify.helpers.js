export function normalizeRealVerifyForm({ realName = '', idCard = '' } = {}) {
  const normalizedRealName = String(realName).trim()
  const normalizedIdCard = String(idCard).trim()

  if (!normalizedRealName) {
    return {
      valid: false,
      message: '请填写真实姓名',
    }
  }

  if (!/^\d{17}[\dXx]$/.test(normalizedIdCard)) {
    return {
      valid: false,
      message: '请填写正确的18位身份证号',
    }
  }

  return {
    valid: true,
    realName: normalizedRealName,
    idCard: normalizedIdCard,
  }
}

export function buildRealVerifyLaunchOptions({ targetAppId = '', path = '', extraData = {} } = {}) {
  return {
    appId: targetAppId,
    path,
    extraData,
    envVersion: 'release',
  }
}

export function getRealVerifyLaunchErrorMessage(error) {
  const message = error?.errMsg || error?.message || ''
  if (message.includes('cancel')) {
    return '您已取消实名认证'
  }
  return '发起实名认证失败，请重试'
}
