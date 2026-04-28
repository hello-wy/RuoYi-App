function splitCsv(value) {
  if (value === null || value === undefined || value === '') {
    return []
  }
  return String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

function toAbsoluteUrl(baseUrl = '', value = '') {
  if (!value) return ''
  return value.startsWith('http') ? value : `${baseUrl}${value}`
}

export function buildApplyPageMode(query = {}) {
  return query?.mode === 'edit' ? 'edit' : 'create'
}

export function buildApplyFormStateFromTutor(profile = {}, baseUrl = '', avatarSrc = '') {
  const subjects = splitCsv(profile.subjects)
  const selectedAreaCodes = splitCsv(profile.areas)

  return {
    form: {
      realName: profile.realName || '',
      idCard: profile.idCard || '',
      identity: profile.identity ?? 0,
      city: profile.city || '',
      school: profile.school || '',
      major: profile.major || '',
      degree: profile.degree ?? '',
      subjects,
      areas: selectedAreaCodes.join(','),
      methods: profile.methods ?? '',
      experience: profile.experience || '',
      certificateList: profile.certificateList || '',
      selfJudge: profile.selfJudge || '',
      certificates: profile.certificates || ''
    },
    selectedAreaCodes,
    avatarPreviewUrl: avatarSrc || toAbsoluteUrl(baseUrl, profile.avatar || ''),
    certificatePreviewUrl: toAbsoluteUrl(baseUrl, profile.certificates || '')
  }
}
