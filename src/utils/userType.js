export const USER_TYPES = Object.freeze({
  PARENT: 0,
  STUDENT: 1,
  MERCHANT: 2
})

export const EMPTY_USER_TYPE = ''

export function hasUserType(value) {
  return value !== null && value !== undefined && value !== EMPTY_USER_TYPE
}

export function normalizeUserType(value) {
  if (!hasUserType(value)) {
    return EMPTY_USER_TYPE
  }
  const numberValue = Number(value)
  return Number.isNaN(numberValue) ? value : numberValue
}
