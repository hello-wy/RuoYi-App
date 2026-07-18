export function createLectureListState() {
  return {
    pageNum: 1,
    pageSize: 10,
    name: '',
    list: [],
    total: 0,
    loading: false,
    finished: false,
    loadError: false,
    refreshing: false
  }
}

export function buildLectureListQuery(state = {}) {
  const name = String(state.name || '').trim()
  return {
    pageNum: Number(state.pageNum || 1),
    pageSize: Number(state.pageSize || 10),
    ...(name ? { name } : {})
  }
}

export function createLectureForm() {
  return {
    id: '',
    name: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    geo: '',
    speaker: '',
    coverId: '',
    detail: '',
    registrationFee: '',
    deposit: '',
    coursePrice: '',
    requiresEnrollment: true
  }
}

export function normalizeLectureForm(lecture = {}) {
  const [startDate = '', startTime = ''] = String(lecture.time || '').split(' ')
  const [endDate = '', endTime = ''] = String(lecture.endDate || '').split(' ')
  return {
    ...createLectureForm(),
    id: lecture.id || '',
    name: lecture.name || '',
    startDate,
    startTime,
    endDate,
    endTime,
    location: lecture.location || '',
    geo: lecture.geo || '',
    speaker: lecture.speaker || '',
    coverId: lecture.coverId || '',
    detail: lecture.detail || '',
    registrationFee: lecture.registrationFee ?? '',
    deposit: lecture.deposit ?? '',
    coursePrice: lecture.coursePrice ?? '',
    requiresEnrollment: lecture.requiresEnrollment !== false
  }
}

export function applyLectureTemplate(form, template) {
  return {
    ...form,
    speaker: template.speaker || '',
    coverId: template.coverId || '',
    detail: template.detail || '',
    registrationFee: template.registrationFee ?? '',
    deposit: template.deposit ?? '',
    coursePrice: template.coursePrice ?? '',
    requiresEnrollment: template.requiresEnrollment !== false
  }
}

function numberOrNull(value) {
  const text = String(value ?? '').trim()
  return text === '' ? null : Number(text)
}

export function buildLecturePayload(form = {}) {
  const payload = {
    name: String(form.name || '').trim(),
    time: `${form.startDate || ''} ${form.startTime || ''}`.trim(),
    endDate: `${form.endDate || ''} ${form.endTime || ''}`.trim(),
    location: String(form.location || '').trim(),
    geo: String(form.geo || '').trim(),
    speaker: String(form.speaker || '').split(',').map(item => item.trim()).filter(Boolean).join(','),
    coverId: numberOrNull(form.coverId),
    detail: String(form.detail || '').trim(),
    registrationFee: numberOrNull(form.registrationFee),
    deposit: numberOrNull(form.deposit),
    coursePrice: numberOrNull(form.coursePrice),
    requiresEnrollment: Boolean(form.requiresEnrollment)
  }
  if (form.id) {
    payload.id = form.id
    payload.coursePriceUpdated = true
  }
  return payload
}

export function validateLecturePayload(payload) {
  if (!payload.name) return '请输入课程名称'
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(payload.time)) return '请选择开课时间'
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(payload.endDate)) return '请选择结束时间'
  if (new Date(payload.endDate.replace(/-/g, '/')) <= new Date(payload.time.replace(/-/g, '/'))) return '结束时间必须晚于开课时间'
  if (!payload.location) return '请输入上课地址'
  if (payload.geo && !/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(payload.geo)) return '经纬度格式应为“经度,纬度”'
  for (const field of ['registrationFee', 'deposit', 'coursePrice']) {
    if (payload[field] !== null && (!Number.isFinite(payload[field]) || payload[field] < 0)) return '费用金额必须为非负数'
  }
  if (payload.coverId !== null && (!Number.isInteger(payload.coverId) || payload.coverId <= 0)) return '封面目录 ID 必须为正整数'
  return ''
}
