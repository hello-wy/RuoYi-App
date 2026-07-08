const STORAGE_KEY = 'personality_answer_progress'

function normalizeAttemptId(attemptId) {
  return String(attemptId || '')
}

function readProgressMap() {
  const value = uni.getStorageSync(STORAGE_KEY)
  return value && typeof value === 'object' ? value : {}
}

export function getPersonalityProgress(attemptId) {
  const key = normalizeAttemptId(attemptId)
  if (!key) return null
  return readProgressMap()[key] || null
}

export function setPersonalityProgress(attemptId, progress) {
  const key = normalizeAttemptId(attemptId)
  if (!key) return
  const progressMap = readProgressMap()
  progressMap[key] = progress
  uni.setStorageSync(STORAGE_KEY, progressMap)
}

export function removePersonalityProgress(attemptId) {
  const key = normalizeAttemptId(attemptId)
  if (!key) return
  const progressMap = readProgressMap()
  if (!progressMap[key]) return
  delete progressMap[key]
  uni.setStorageSync(STORAGE_KEY, progressMap)
}
