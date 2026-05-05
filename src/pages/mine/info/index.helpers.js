const PHONE_PATTERN = /^$|^1[3-9]\d{9}$/
const AGE_PATTERN = /^\d+$/
const MAX_NAME_LENGTH = 64
const MAX_AGE = 120

export function createInfoForm() {
  return {
    userName: '',
    phone: '',
    userType: '',
    realName: '',
    isRealnameAuth: 0,
    nickName: '',
    gender: '',
    age: '',
    companyName: '',
    companyAddress: '',
    companyPosition: '',
    industry: '',
    workYears: '',
    personalIntro: '',
    availableTime: '',
    workExperience: ''
  }
}

export function normalizeInfoForm(data = {}) {
  return {
    ...createInfoForm(),
    userName: data.userName || '',
    phone: data.phone || '',
    userType: normalizeUserType(data.userType),
    realName: data.realName || '',
    isRealnameAuth: data.isRealnameAuth || 0,
    nickName: data.nickName || '',
    gender: normalizeGender(data.gender),
    age: data.age === null || data.age === undefined ? '' : String(data.age),
    companyName: data.companyName || '',
    companyAddress: data.companyAddress || '',
    companyPosition: data.companyPosition || '',
    industry: data.industry || '',
    workYears: data.workYears || '',
    personalIntro: data.personalIntro || '',
    availableTime: data.availableTime || '',
    workExperience: data.workExperience || ''
  }
}

export function getInfoUserTypeText(value) {
  if (Number(value) === 0) return '家长'
  if (Number(value) === 1) return '学生'
  if (Number(value) === 2) return '商家'
  if (Number(value) === 3) return '兼职'
  return '家长 / 学生'
}

export function isMerchantInfoForm(form) {
  return Number(form.userType) === 2
}

export function isAuntInfoForm(form) {
  return Number(form.userType) === 3
}

export function buildInfoSubmitPayload(form, options = {}) {
  const payload = buildBasePayload(form)
  if (options.omitRealName) {
    delete payload.realName
  }

  if (isMerchantInfoForm(form)) {
    return {
      ...payload,
      companyName: trimValue(form.companyName),
      companyAddress: trimValue(form.companyAddress),
      companyPosition: trimValue(form.companyPosition),
      industry: trimValue(form.industry),
      workYears: trimValue(form.workYears),
      availableTime: '',
      workExperience: ''
    }
  }

  if (isAuntInfoForm(form)) {
    return {
      ...payload,
      companyName: '',
      companyAddress: '',
      companyPosition: '',
      industry: '',
      workYears: '',
      availableTime: trimValue(form.availableTime),
      workExperience: trimValue(form.workExperience)
    }
  }

  return {
    ...payload,
    companyName: '',
    companyAddress: '',
    companyPosition: '',
    industry: '',
    workYears: '',
    personalIntro: '',
    availableTime: '',
    workExperience: ''
  }
}

export function validateInfoForm(form) {
  if (trimValue(form.nickName).length > MAX_NAME_LENGTH) return '昵称长度不能超过64个字符'
  if (!PHONE_PATTERN.test(trimValue(form.phone))) return '请输入正确的手机号码'
  if (!isAuntInfoForm(form)) return ''
  const ageText = trimValue(form.age)
  if (ageText === '') return ''
  if (!AGE_PATTERN.test(ageText)) return '请输入正确年龄'
  if (Number(ageText) < 1 || Number(ageText) > MAX_AGE) return '请输入正确年龄'
  return ''
}

function buildBasePayload(form) {
  return {
    userName: form.userName,
    phone: form.phone,
    realName: trimValue(form.realName),
    nickName: trimValue(form.nickName),
    gender: form.gender,
    age: isAuntInfoForm(form) && form.age !== '' ? Number(form.age) : null,
    personalIntro: trimValue(form.personalIntro)
  }
}

function normalizeUserType(value) {
  return value === null || value === undefined || value === '' ? '' : Number(value)
}

function normalizeGender(value) {
  return value === null || value === undefined ? '' : Number(value)
}

function trimValue(value) {
  return String(value || '').trim()
}
