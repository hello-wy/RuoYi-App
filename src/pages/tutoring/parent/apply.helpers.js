import { normalizeUserType, USER_TYPES } from '@/utils/userType'

function trimText(value) {
  return String(value || '').trim()
}

function parseCsv(value) {
  return trimText(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

function normalizeAreaRegion(region = '') {
  const text = trimText(region)
  const parts = text.split(/\s+|\//).filter(Boolean)
  return {
    province: parts[0] || '',
    city: parts[1] || '',
    district: parts[2] || parts[1] || parts[0] || '',
    code: ''
  }
}

function sortDateList(list = []) {
  return [...new Set((Array.isArray(list) ? list : []).map(item => trimText(item)).filter(Boolean))].sort()
}

function buildAddressText(address = {}) {
  const parts = [
    trimText(address.location),
    trimText(address.addressDetail),
    trimText(address.doorplate)
  ].filter(Boolean)
  return parts.join(' ')
}

export function formatAddressLabel(address = {}) {
  return buildAddressText(address)
}

export function formatAddressMeta(address = {}) {
  return trimText(address.contactName)
}

function buildDetailAddressFallback(detail = {}) {
  const parts = [trimText(detail.location), trimText(detail.addressDetail), trimText(detail.doorplate)].filter(Boolean)
  return parts.join(' ')
}

function calculateDurationHours(startTime, endTime) {
  const start = trimText(startTime)
  const end = trimText(endTime)
  const startMatch = start.match(/^(\d{2}):(\d{2})$/)
  const endMatch = end.match(/^(\d{2}):(\d{2})$/)
  if (!startMatch || !endMatch) return '2'
  const startMinutes = Number(startMatch[1]) * 60 + Number(startMatch[2])
  let endMinutes = Number(endMatch[1]) * 60 + Number(endMatch[2])
  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60
  }
  const diffHours = (endMinutes - startMinutes) / 60
  if (!diffHours || diffHours <= 0) return '2'
  return Number.isInteger(diffHours) ? String(diffHours) : String(diffHours)
}

function parseServiceTimes(serviceTimes, startTime, endTime) {
  try {
    const parsed = JSON.parse(trimText(serviceTimes) || '[]')
    if (Array.isArray(parsed)) {
      const slotMap = new Map()
      parsed.forEach(item => {
        const serviceDate = trimText(item?.serviceDate)
        const slotStartTime = trimText(item?.startTime)
        const slotEndTime = trimText(item?.endTime)
        if (!serviceDate && !slotStartTime && !slotEndTime) return
        const key = `${slotStartTime}-${slotEndTime}`
        const current = slotMap.get(key) || {
          serviceDates: [],
          startTime: slotStartTime,
          endTime: slotEndTime,
          durationHours: calculateDurationHours(slotStartTime, slotEndTime)
        }
        current.serviceDates = sortDateList([...current.serviceDates, serviceDate])
        slotMap.set(key, current)
      })
      const slots = Array.from(slotMap.values()).filter(item => item.serviceDates.length || item.startTime || item.endTime)
      if (slots.length) return slots
    }
  } catch (e) { }

  if (trimText(startTime) || trimText(endTime)) {
    return [{
      serviceDates: [],
      startTime: trimText(startTime) || '08:00',
      endTime: trimText(endTime),
      durationHours: calculateDurationHours(startTime || '08:00', endTime)
    }]
  }

  return [{ serviceDates: [], startTime: '08:00', endTime: '10:00', durationHours: '2' }]
}

function getWeekdayValue(dateText) {
  const value = trimText(dateText)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return ''
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return ''
  const day = date.getDay()
  return String(day === 0 ? 7 : day)
}

function buildDayOfWeekCsv(dateList = []) {
  return [...new Set(sortDateList(dateList).map(getWeekdayValue).filter(Boolean))].sort((a, b) => Number(a) - Number(b)).join(',')
}

export function canUseBabyPicker(userType) {
  return normalizeUserType(userType) === USER_TYPES.PARENT
}

export function buildBabyDisplayName(baby = {}) {
  const realName = trimText(baby.realName)
  const nickName = trimText(baby.nickName)
  if (realName && nickName) return `${realName}（${nickName}）`
  if (realName) return realName
  if (nickName) return nickName
  return '未命名萌娃'
}

function buildBabyMeta(baby = {}) {
  return trimText(baby.grade || baby.birthDate)
}

export function normalizeBabyList(list = []) {
  return (Array.isArray(list) ? list : []).map(item => ({
    id: item.id,
    realName: item.realName,
    displayName: buildBabyDisplayName(item),
    meta: buildBabyMeta(item),
    grade: trimText(item.grade)
  }))
}

export function shouldShowBabyEmptyState(visible, babyList) {
  return Boolean(visible) && (!Array.isArray(babyList) || babyList.length === 0)
}

function createDefaultTimeSlot() {
  return {
    serviceDates: [],
    startTime: '08:00',
    endTime: '10:00',
    durationHours: '2'
  }
}

export function buildParentApplyDefaultForm() {
  return {
    name: '',
    phone: '',
    addressId: '',
    addressLabel: '',
    addressMeta: '',
    babyId: '',
    babyName: '',
    babyMeta: '',
    grade: '',
    subject: '',
    timeSlots: [createDefaultTimeSlot()],
    methods: '',
    demandItems: [],
    description: '',
    requirements: '',
    genderRequirement: '0',
    hourlyBudget: '60'
  }
}

export function validateParentApplyForm(form = {}, userType) {
  if (!trimText(form.name)) return '请填写需求描述'
  if (!canUseBabyPicker(userType)) return '请先切换为家长身份'
  if (!form.addressId) return '请选择服务地址'
  if (!form.babyId) return '请选择服务萌娃'
  if (!trimText(form.grade)) return '请选择年级'
  if (!trimText(form.subject)) return '请选择学科'
  if (!Array.isArray(form.timeSlots) || !form.timeSlots.length) return '请添加服务时段'
  if (form.timeSlots.some(item => !Array.isArray(item.serviceDates) || !item.serviceDates.length || !trimText(item.startTime) || !trimText(item.endTime) || Number(item.durationHours) <= 0)) return '请完善服务时段'
  const dateCountMap = new Map()
  form.timeSlots.forEach(item => {
    sortDateList(item.serviceDates).forEach(date => {
      dateCountMap.set(date, (dateCountMap.get(date) || 0) + 1)
    })
  })
  if (Array.from(dateCountMap.values()).some(count => count > 1)) return '服务日期不能在不同时间段重复选择'
  if (!form.methods) return '请选择授课方式'
  if (!Array.isArray(form.demandItems) || !form.demandItems.length) return '请选择服务需求项目'
  if (trimText(form.genderRequirement) === '') return '请选择陪伴官性别要求'
  if (!trimText(form.hourlyBudget)) return '请填写时薪预算'
  return ''
}

export function buildParentApplyPayload(form = {}) {
  const serviceTimes = (Array.isArray(form.timeSlots) ? form.timeSlots : [])
    .filter(item => trimText(item.startTime) && trimText(item.endTime))
    .flatMap(item => sortDateList(item.serviceDates).map(serviceDate => ({
      serviceDate,
      startTime: trimText(item.startTime),
      endTime: trimText(item.endTime)
    })))

  const serviceDates = sortDateList(serviceTimes.map(item => item.serviceDate))

  return {
    name: trimText(form.name),
    phone: trimText(form.phone),
    babyId: form.babyId,
    addressId: form.addressId,
    grade: trimText(form.grade),
    subject: trimText(form.subject),
    dayOfWeek: buildDayOfWeekCsv(serviceDates),
    serviceDates: serviceDates.join(','),
    serviceTimes: JSON.stringify(serviceTimes),
    startTime: serviceTimes[0]?.startTime || '08:00',
    endTime: serviceTimes[0]?.endTime || '10:00',
    methods: form.methods,
    demandItems: (Array.isArray(form.demandItems) ? form.demandItems : []).map(item => String(item).trim()).filter(Boolean).join(','),
    genderRequirement: trimText(form.genderRequirement),
    hourlyBudget: trimText(form.hourlyBudget)
  }
}
export function buildParentApplyForm(detail = {}, babyList = [], addressList = []) {
  const selectedBaby = babyList.find(item => String(item.id) === String(detail.babyId))
  const selectedAddress = addressList.find(item => String(item.id) === String(detail.addressId))
  const timeSlots = parseServiceTimes(detail.serviceTimes, detail.startTime, detail.endTime)

  return {
    name: detail.name || '',
    phone: detail.phone || '',
    addressId: detail.addressId || '',
    addressLabel: selectedAddress ? formatAddressLabel(selectedAddress) : buildDetailAddressFallback(detail),
    addressMeta: selectedAddress ? formatAddressMeta(selectedAddress) : '',
    babyId: detail.babyId || '',
    babyName: selectedBaby?.displayName || '',
    babyMeta: selectedBaby?.meta || '',
    grade: detail.grade || selectedBaby?.grade || '',
    subject: detail.subject || '',
    timeSlots,
    methods: detail.methods || '',
    demandItems: parseCsv(detail.demandItems),
    genderRequirement: trimText(detail.genderRequirement ?? '0') || '0',
    hourlyBudget: trimText(detail.hourlyBudget ?? '60') || '60'
  }
}

export function resolveParentApplyEntryAction({ token, userType, isEditMode, checkingExistingDemand }) {
  if (!trimText(token)) {
    return { type: 'login' }
  }
  if (!canUseBabyPicker(userType)) {
    return { type: 'userTypeGuard' }
  }
  if (isEditMode || checkingExistingDemand) {
    return { type: 'none' }
  }
  return { type: 'checkExistingDemand' }
}
