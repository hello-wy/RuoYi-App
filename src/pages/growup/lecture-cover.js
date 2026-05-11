const lectureImageSrcCache = new Map()
const lectureImagePendingTasks = new Map()

export function formatLectureImageVersion(updateDate) {
  const version = String(updateDate || '').replace(/\D/g, '')
  return version ? `?v=${version}` : ''
}

export function resolveLectureCoverDirectoryId(lecture = {}) {
  return lecture?.coverId || lecture?.id || ''
}

export function buildLectureImageUrl({ baseUrl, lecture, fileName }) {
  const normalizedBaseUrl = String(baseUrl || '').replace(/\/+$/, '')
  const directoryId = resolveLectureCoverDirectoryId(lecture)
  const version = formatLectureImageVersion(lecture?.updateDate)
  return `${normalizedBaseUrl}/lectures/${directoryId}/${fileName}${version}`
}

export function getLectureImageSrc(options) {
  const remoteUrl = buildLectureImageUrl(options)
  return lectureImageSrcCache.get(remoteUrl) || remoteUrl
}

export function prefetchLectureImage(url) {
  if (!url) return Promise.resolve('')

  const cachedSrc = lectureImageSrcCache.get(url)
  if (cachedSrc) {
    return Promise.resolve(cachedSrc)
  }

  const pendingTask = lectureImagePendingTasks.get(url)
  if (pendingTask) {
    return pendingTask
  }

  const task = new Promise((resolve) => {
    uni.getImageInfo({
      src: url,
      success: (res) => {
        const localPath = res?.path || url
        lectureImageSrcCache.set(url, localPath)
        resolve(localPath)
      },
      fail: () => {
        resolve(url)
      }
    })
  }).finally(() => {
    lectureImagePendingTasks.delete(url)
  })

  lectureImagePendingTasks.set(url, task)
  return task
}

export function prefetchLectureCovers({ baseUrl, lectures = [], fileName = 'cover.webp' }) {
  const urls = Array.from(
    new Set(
      lectures
        .map(lecture => buildLectureImageUrl({ baseUrl, lecture, fileName }))
        .filter(Boolean)
    )
  )

  return Promise.all(urls.map(url => prefetchLectureImage(url)))
}
