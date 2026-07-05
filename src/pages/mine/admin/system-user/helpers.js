const PASSWORD_ILLEGAL_PATTERN = /[<>"'\\|]/

export function buildEmptySystemUserForm() {
  return {
    userId: undefined,
    phonenumber: '',
    userName: '',
    nickName: '',
    rawPassword: '',
    adminLevel: 'employee',
    deptId: undefined,
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

export function validateSystemUserPassword(rawPassword, required = true) {
  const password = String(rawPassword || '').trim()
  if (!password) {
    return required
      ? { valid: false, message: '请输入登录密码' }
      : { valid: true, message: '' }
  }
  if (password.length < 5 || password.length > 20) {
    return { valid: false, message: '密码长度必须在5到20个字符之间' }
  }
  if (PASSWORD_ILLEGAL_PATTERN.test(password)) {
    return { valid: false, message: '密码不能包含非法字符：< > " \' \\ |' }
  }
  return { valid: true, message: '' }
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
  if (!form.deptId) {
    return { valid: false, message: '请选择部门' }
  }
  return validateSystemUserPassword(rawPassword, !form.userId)
}
