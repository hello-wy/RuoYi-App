import {
  TUTOR_MATERIAL_TYPES,
  TUTOR_SINGLETON_MATERIAL_TYPES,
} from './material.constants'

const MANAGED_PROFILE_URL_PATTERN = /^https?:\/\/[^/]+(\/profile\/.*)$/i
const MATERIAL_ID_QUERY_KEY = 'materialId'

function joinBaseUrl(baseUrl = '', path = '') {
  const normalizedBase = String(baseUrl || '').trim().replace(/\/+$/, '')
  const normalizedPath = String(path || '').trim().replace(/^\/+/, '')
  if (!normalizedPath) return ''
  return normalizedBase ? `${normalizedBase}/${normalizedPath}` : `/${normalizedPath}`
}

function toAbsoluteUrl(baseUrl, value) {
  const normalizedValue = String(value || '').trim()
  if (!normalizedValue) return ''

  const managedPath = normalizedValue.match(MANAGED_PROFILE_URL_PATTERN)?.[1]
  if (managedPath) return joinBaseUrl(baseUrl, managedPath)
  if (/^https?:\/\//i.test(normalizedValue)) return normalizedValue
  return joinBaseUrl(baseUrl, normalizedValue)
}

export function normalizeTutorMaterial(material = {}, baseUrl = '') {
  return {
    id: material.id === null || material.id === undefined ? '' : String(material.id),
    type: Number(material.type),
    typeName: String(material.typeName || ''),
    directoryName: String(material.directoryName || ''),
    url: toAbsoluteUrl(baseUrl, material.url || ''),
  }
}

export function normalizeTutorMaterials(materials = [], baseUrl = '') {
  if (!Array.isArray(materials)) return []
  return materials
    .map(material => normalizeTutorMaterial(material, baseUrl))
    .filter(material => material.id && material.url && isTutorMaterialType(material.type))
}

export function buildTutorMaterialImageUrl(material = {}) {
  const url = String(material?.url || '').trim()
  const id = String(material?.id ?? '').trim()
  if (!url || !id) return url

  const hashIndex = url.indexOf('#')
  const hash = hashIndex >= 0 ? url.slice(hashIndex) : ''
  const urlWithoutHash = hashIndex >= 0 ? url.slice(0, hashIndex) : url
  const queryIndex = urlWithoutHash.indexOf('?')
  const path = queryIndex >= 0 ? urlWithoutHash.slice(0, queryIndex) : urlWithoutHash
  const query = queryIndex >= 0 ? urlWithoutHash.slice(queryIndex + 1) : ''
  const materialIdKey = MATERIAL_ID_QUERY_KEY.toLowerCase()
  const parameters = query
    .split('&')
    .filter(Boolean)
    .filter(parameter => parameter.split('=', 1)[0].toLowerCase() !== materialIdKey)

  parameters.push(`${MATERIAL_ID_QUERY_KEY}=${encodeURIComponent(id)}`)
  return `${path}?${parameters.join('&')}${hash}`
}

export function buildTutorMaterialPreviewOptions(materials = [], target = {}) {
  const urls = materials.map(buildTutorMaterialImageUrl).filter(Boolean)
  return {
    urls,
    current: buildTutorMaterialImageUrl(target),
  }
}

export function buildTutorMaterialIdList(materials = []) {
  return materials
    .map(material => material?.id)
    .filter(id => id !== null && id !== undefined && String(id).trim())
    .map(id => String(id).trim())
    .join(',')
}

export function upsertTutorMaterial(materials = [], material = {}) {
  const normalizedType = Number(material.type)
  const normalizedMaterial = { ...material, id: String(material.id), type: normalizedType }
  if (!TUTOR_SINGLETON_MATERIAL_TYPES.includes(normalizedType)) {
    return [...materials, normalizedMaterial]
  }
  const existingIndex = materials.findIndex(item => Number(item.type) === normalizedType)
  if (existingIndex < 0) return [...materials, normalizedMaterial]
  return materials.map((item, index) => index === existingIndex ? normalizedMaterial : item)
}

export function removeTutorMaterial(materials = [], target = {}) {
  const targetId = String(target.id ?? '')
  return materials.filter(material => String(material.id ?? '') !== targetId)
}

export function getTutorMaterialsByType(materials = [], type) {
  return materials.filter(material => Number(material.type) === Number(type))
}

function isTutorMaterialType(type) {
  return Object.values(TUTOR_MATERIAL_TYPES).includes(type)
}
