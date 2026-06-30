export function buildEmptySystemUserForm() {
  return {
    userId: undefined,
    phonenumber: '',
    userName: '',
    nickName: '',
    rawPassword: '',
    adminLevel: 'employee',
    status: '0',
    remark: '',
    roleIds: [],
    postIds: []
  }
}

export function buildSystemUserPayload(form = {}) {
  const phonenumber = String(form.phonenumber || '').trim()
  const rawPassword = String(form.rawPassword || '').trim()
  const payload = {
    ...form,
    phonenumber,
    userName: phonenumber
  }

  if (rawPassword) {
    return {
      ...payload,
      rawPassword
    }
  }
  const { rawPassword: _rawPassword, ...payloadWithoutPassword } = payload
  return payloadWithoutPassword
}

export function validateSystemUserForm(form = {}) {
  const phonenumber = String(form.phonenumber || '').trim()
  const nickName = String(form.nickName || '').trim()
  const rawPassword = String(form.rawPassword || '').trim()

  if (!/^1[3-9]\d{9}$/.test(phonenumber)) {
    return { valid: false, message: '请输入正确的手机号' }
  }
  if (!nickName) {
    return { valid: false, message: '请输入用户昵称' }
  }
  if (!form.adminLevel) {
    return { valid: false, message: '请选择管理员层级' }
  }
  if (!form.userId && !rawPassword) {
    return { valid: false, message: '请输入登录密码' }
  }
  return { valid: true, message: '' }
}
