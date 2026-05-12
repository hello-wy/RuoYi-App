export function buildMerchantUserTypeWhitelistPayload(form = {}) {
  return {
    realName: String(form.realName || '').trim(),
    idCard: String(form.idCard || '').trim().toUpperCase(),
    remark: String(form.remark || '').trim(),
  }
}

export function validateMerchantUserTypeWhitelistForm(form = {}) {
  const realName = String(form.realName || '').trim()
  const idCard = String(form.idCard || '').trim().toUpperCase()

  if (!realName) {
    return { valid: false, message: '请填写真实姓名' }
  }
  if (!/^\d{17}[\dX]$/.test(idCard)) {
    return { valid: false, message: '请填写正确的18位身份证号' }
  }
  return { valid: true, message: '' }
}
