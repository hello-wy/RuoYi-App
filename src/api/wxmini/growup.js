import config from '@/config'
import request from '@/utils/request'

const baseUrl = config.baseUrl

function isAbsoluteUrl(url) {
    return /^(?:[a-z][a-z\d+\-.]*:)?\/\//i.test(url || '')
}

function joinUrl(base = '', path = '') {
    const normalizedBase = String(base || '').replace(/\/+$/, '')
    const normalizedPath = String(path || '').replace(/^\/+/, '')
    return normalizedPath ? `${normalizedBase}/${normalizedPath}` : normalizedBase
}

function normalizeDownloadUrl(url) {
    if (!url) return ''
    if (isAbsoluteUrl(url)) return url
    return baseUrl ? joinUrl(baseUrl, url) : url
}

function formatFileSize(size) {
    const bytes = Number(size)
    if (!Number.isFinite(bytes) || bytes < 0) return ''
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)}MB`
    return `${(bytes / 1024 / 1024 / 1024).toFixed(1)}GB`
}

function normalizeMaterial(row = {}) {
    const sourceUrl = row.downloadUrl || row.filePath || row.relativePath || row.url || ''
    const downloadUrl = normalizeDownloadUrl(sourceUrl)
    const fileSizeText = row.fileSizeText || row.sizeText || formatFileSize(row.fileSize)
    const fileType = String(row.fileType || row.type || 'other').toLowerCase()

    return {
        ...row,
        id: row.id,
        name: row.name || row.originalName || row.title || '未命名资料',
        fileType,
        filePath: downloadUrl,
        downloadUrl,
        fileSize: row.fileSize,
        fileSizeText,
        category: row.category || row.tag || '',
        createTime: row.createTime || row.createDate || ''
    }
}

function normalizeMaterialListResponse(res = {}) {
    const rows = Array.isArray(res.rows) ? res.rows : Array.isArray(res.data?.rows) ? res.data.rows : []
    const total = Number(res.total ?? res.data?.total ?? rows.length) || 0

    return {
        ...res,
        rows: rows.map(normalizeMaterial),
        total
    }
}

//获得最近所有课程
export function listCourse(query) {
    return request({
        url: '/wxmini/growup/courses',
        method: 'get',
        params: query
    })
}

// 展示讲师风采列表
export function listTutor(query) {
    return request({
        url: '/wxmini/growup/tutors/list',
        method: 'get',
        params: query
    })
}

export function getCourse(id) {
    return request({
        url: `/wxmini/growup/courses/${id}`,
        method: 'get'
    })
}

export function getCourseEnrollment(id) {
    return request({
        url: `/wxmini/growup/courses/${id}/enrollment`,
        method: 'get'
    })
}

export function enrollCourse(id, data) {
    return request({
        url: `/wxmini/growup/courses/${id}/enroll`,
        method: 'post',
        data
    })
}

export function getEnrollmentsList() {
    return request({
        url: `/wxmini/growup/enrollments/list`,
        method: 'get'
    })
}

export function getTotalEnrollments() {
    return request({
        url: `/wxmini/growup/enrollments/total`,
        method: 'get'
    })
}

export function listMaterials(query) {
    return request({
        url: '/wxmini/growup/materials',
        method: 'get',
        params: query
    }).then(normalizeMaterialListResponse)
}
