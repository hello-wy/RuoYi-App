import { normalizeTutorMaterials } from './material.helpers'

function splitCsv(value) {
  if (value === null || value === undefined || value === '') return []
  return String(value).split(',').map(item => item.trim()).filter(Boolean)
}

function toAbsoluteUrl(baseUrl = '', value = '') {
  if (!value) return ''
  return value.startsWith('http') ? value : `${baseUrl}${value}`
}

function normalizeIdentity(value) {
  if (value === null || value === undefined || value === '') return 0
  const parsed = Number(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

function normalizeMethod(value) {
  if (value === null || value === undefined || value === '') return ''
  return String(value)
}

export function buildApplyPageMode(query = {}) {
  return query?.mode === 'edit' ? 'edit' : 'create'
}

export function shouldInitializeApplyPage({ initialized = false, initializing = false } = {}) {
  return !initialized && !initializing
}

export function buildApplyFormStateFromTutor(profile = {}, baseUrl = '', avatarSrc = '') {
  const subjects = splitCsv(profile.subjects)
  const selectedAreaCodes = splitCsv(profile.areas)
  const materials = normalizeTutorMaterials(profile.materials, baseUrl)

  return {
    form: {
      realName: profile.realName || '',
      idCard: profile.idCard || '',
      identity: normalizeIdentity(profile.identity),
      city: profile.city || '',
      school: profile.school || '',
      major: profile.major || '',
      degree: profile.degree ?? '',
      currentGrade: profile.currentGrade || '',
      subjects,
      areas: selectedAreaCodes.join(','),
      methods: normalizeMethod(profile.methods),
      experience: profile.experience || '',
      certificateList: profile.certificateList || '',
      selfJudge: profile.selfJudge || '',
      avatar: avatarSrc || toAbsoluteUrl(baseUrl, profile.avatar || ''),
      certificates: profile.certificates || '',
      materials,
    },
    selectedAreaCodes,
  }
}
