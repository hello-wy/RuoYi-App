export function buildParttimeWhitelistPayload(form = {}) {
  return {
    realName: String(form.realName || '').trim(),
    idCard: String(form.idCard || '').trim().toUpperCase(),
    price: Number(String(form.price || '').trim()),
    remark: String(form.remark || '').trim(),
  }
}

export function validateParttimeWhitelistForm(form = {}) {
  const realName = String(form.realName || '').trim()
  const idCard = String(form.idCard || '').trim().toUpperCase()
  const price = String(form.price || '').trim()

  if (!realName) {
    return { valid: false, message: '请填写真实姓名' }
  }
  if (!/^\d{17}[\dX]$/.test(idCard)) {
    return { valid: false, message: '请填写正确的18位身份证号' }
  }
  if (!price) {
    return { valid: false, message: '请填写价格' }
  }
  return { valid: true, message: '' }
}
