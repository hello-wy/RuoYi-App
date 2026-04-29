import { normalizeUserType, USER_TYPES } from '@/utils/userType'

export function canUseBabyPicker(userType) {
  return normalizeUserType(userType) === USER_TYPES.PARENT
}

export function buildBabyDisplayName(baby = {}) {
  const realName = (baby.realName || '').trim()
  const nickName = (baby.nickName || '').trim()
  if (realName && nickName) return `${realName}（${nickName}）`
  if (realName) return realName
  if (nickName) return nickName
  return '未命名萌娃'
}

function buildBabyMeta(baby = {}) {
  return (baby.grade || baby.birthDate || '').trim()
}

function normalizeAreaRegion(region = '') {
  const text = String(region || '').trim()
  const parts = text.split(/[\s,/，|-]+/).filter(Boolean)
  return {
    province: parts[0] || '',
    city: parts[1] || '',
    district: parts[2] || parts[1] || parts[0] || '',
    code: ''
  }
}

export function normalizeBabyList(list = []) {
  return (Array.isArray(list) ? list : []).map(item => ({
    id: item.id,
    realName: item.realName,
    displayName: buildBabyDisplayName(item),
    meta: buildBabyMeta(item),
    grade: (item.grade || '').trim()
  }))
}

export function shouldShowBabyEmptyState(visible, babyList) {
  return Boolean(visible) && (!Array.isArray(babyList) || babyList.length === 0)
}

export function validateParentApplyForm(form = {}, userType) {
  if (!(form.name || '').trim()) return '请填写需求描述'
  if (!/^1[3-9]\d{9}$/.test(form.phone || '')) return '请填写正确的手机号'
  if (!canUseBabyPicker(userType)) return '请先切换为家长身份'
  if (!form.babyId) return '请选择服务萌娃'
  if (!(form.grade || '').trim()) return '请选择年级'
  if (!(form.subject || '').trim()) return '请选择学科'
  if (!form.region?.district) return '请选择授课地址（省/市/区）'
  if (!(form.detail || '').trim()) return '请填写详细地址'
  if (!form.dayOfWeek) return '请选择每周上课频次'
  if (!form.startTime) return '请选择开始时间'
  if (!form.endTime) return '请选择结束时间'
  if (!form.methods) return '请选择授课方式'
  if (!(form.description || '').trim()) return '请填写学生情况描述'
  return ''
}

export function buildParentApplyPayload(form = {}) {
  return {
    name: form.name,
    phone: form.phone,
    babyId: form.babyId,
    grade: form.grade,
    subject: form.subject,
    location: form.location,
    address: form.location,
    geo: form.geo,
    region: form.region_district,
    dayOfWeek: form.dayOfWeek,
    startTime: form.startTime,
    endTime: form.endTime,
    methods: form.methods,
    brief: form.description,
    requirements: form.requirements
  }
}

export function buildParentApplyForm(detail = {}, babyList = []) {
  const selectedBaby = babyList.find(item => String(item.id) === String(detail.babyId))
  const regionText = String(detail.region || '').trim()
  return {
    name: detail.name || '',
    phone: detail.phone || '',
    babyId: detail.babyId || '',
    babyName: selectedBaby?.displayName || '',
    babyMeta: selectedBaby?.meta || '',
    grade: detail.grade || selectedBaby?.grade || '',
    subject: detail.subject || '',
    region: normalizeAreaRegion(regionText),
    detail: detail.location || '',
    location: detail.location || '',
    geo: detail.geo || '',
    region_district: regionText,
    dayOfWeek: detail.dayOfWeek || '',
    startTime: detail.startTime || '',
    endTime: detail.endTime || '',
    methods: detail.methods || '',
    description: detail.brief || '',
    requirements: detail.requirements || ''
  }
}
