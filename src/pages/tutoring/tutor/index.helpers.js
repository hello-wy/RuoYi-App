import { isHttp } from '@/utils/validate'

export function getTutorDisplayName(profile = {}) {
  return profile.realName || '教员'
}

export function buildTutorSubtitle(profile = {}) {
  const parts = [profile.school, profile.major, profile.currentGrade]
    .map(item => (item || '').trim())
    .filter(Boolean)
  return parts.length ? parts.join('  ') : '暂未完善院校与专业信息'
}

export function formatTutorIdentity(identity) {
  const mapping = {
    0: '大学生教员',
    1: '在职教师',
    2: '其他'
  }
  return mapping[Number(identity)] || '大学生教员'
}

export function getTutorValueByDict(value, options = [], fallback = '暂未填写') {
  if (value === null || value === undefined || value === '') {
    return fallback
  }
  const found = options.find(item => String(item.value) === String(value))
  return found ? found.label : fallback
}

export function mapTutorLabels(value, options = [], split = true) {
  if (value === null || value === undefined || value === '') {
    return []
  }
  const values = split ? String(value).split(',') : [String(value)]
  return values
    .map(item => String(item).trim())
    .filter(Boolean)
    .map(item => {
      const found = options.find(option => String(option.value) === item)
      return found ? found.label || found.text : item
    })
}

export function formatTutorListText(items = [], fallback = '暂未填写') {
  return items.length ? items.join(' / ') : fallback
}

export function getTutorCertificateItems(source = '') {
  if (!source) return []
  return String(source)
    .split(/[，,、\n]/)
    .map(item => item.trim())
    .filter(Boolean)
}

export function getTutorExperienceList(source = '') {
  if (!source) return []
  return String(source)
    .split(/[\n；;。]/)
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 5)
}

export function buildTutorDetailUrl(id = '', avatarSrc = '') {
  const encodedAvatarSrc = encodeURIComponent(avatarSrc || '')
  return `/pages/tutoring/tutor/detail?id=${id || ''}&avatarSrc=${encodedAvatarSrc}`
}

export function resolveTutorAvatarSrc({ avatarSrc = '', detail = {}, baseUrl = '' } = {}) {
  const detailAvatar = detail?.avatar || ''
  if (detailAvatar) {
    return isHttp(detailAvatar) ? detailAvatar : `${baseUrl}${detailAvatar}`
  }
  if (avatarSrc) return avatarSrc
  const userId = detail?.userId || detail?.user_id || detail?.uid || ''
  return userId ? `${baseUrl}/profile/avatar/${userId}.png` : '/static/images/profile.png'
}
