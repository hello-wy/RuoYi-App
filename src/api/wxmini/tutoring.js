import request from '@/utils/request'
import upload from '@/utils/upload'

function normalizeText(value) {
    return String(value || '').trim()
}

function asArray(value) {
    if (Array.isArray(value)) return value
    return []
}

function pickFirst(values = []) {
    for (const item of values) {
        const text = normalizeText(item)
        if (text) return text
    }
    return ''
}

function normalizePayParam(payParam = {}) {
    const source = payParam || {}
    return {
        ...source,
        packageValue: source.packageValue || source.package || ''
    }
}

function normalizeTutorCandidate(item = {}) {
    return {
        ...item,
        id: item.id ?? item.tutorId ?? item.bindTutorId ?? '',
        tutorId: item.tutorId ?? item.id ?? item.bindTutorId ?? '',
        realName: pickFirst([item.realName, item.tutorName, item.name]),
        school: pickFirst([item.school, item.college]),
        major: pickFirst([item.major]),
        currentGrade: pickFirst([item.currentGrade, item.gradeLabel, item.degreeLabel]),
        subjects: item.subjects || item.subjectIds || '',
        methods: item.methods ?? item.method ?? '',
        avatar: pickFirst([item.avatar, item.avatarUrl]),
        identity: item.identity ?? item.tutorIdentity ?? 0,
        quotePrice: item.quotePrice ?? item.hourlyPrice ?? item.hourlyBudget ?? item.price ?? '',
        bindStatus: item.bindStatus ?? item.status ?? '',
        recommended: Boolean(item.recommended ?? item.isRecommended),
        selected: Boolean(item.selected ?? item.bound)
    }
}

function unwrapListResponse(res = {}) {
    if (Array.isArray(res?.data)) return res.data
    if (Array.isArray(res?.rows)) return res.rows
    if (Array.isArray(res?.data?.rows)) return res.data.rows
    if (Array.isArray(res?.data?.list)) return res.data.list
    if (Array.isArray(res?.data?.records)) return res.data.records
    return []
}

function normalizeTutoringOrder(item = {}) {
    return {
        ...item,
        id: item.id ?? item.orderId ?? '',
        orderNo: pickFirst([item.orderNo, item.outTradeNo]),
        demandId: item.demandId ?? item.parentId ?? item.parentsId ?? '',
        tutorId: item.tutorId ?? item.bindTutorId ?? '',
        tutorName: pickFirst([item.tutorName, item.realName, item.bindTutorName]),
        status: item.status ?? item.orderStatus ?? item.payStatus ?? 0,
        statusLabel: pickFirst([item.statusLabel, item.orderStatusLabel, item.payStatusLabel]),
        payStatus: item.payStatus ?? item.status ?? 0,
        payStatusLabel: pickFirst([item.payStatusLabel, item.statusLabel]),
        amount: item.amount ?? item.totalAmount ?? item.payAmount ?? item.orderAmount ?? 0,
        payParam: normalizePayParam(item.payParam || item.paymentParam || {})
    }
}

function normalizeTutoringSchedule(item = {}) {
    return {
        ...item,
        id: item.id ?? item.scheduleId ?? item.orderId ?? '',
        orderNo: pickFirst([item.orderNo, item.outTradeNo]),
        demandId: item.demandId ?? item.parentId ?? item.parentsId ?? '',
        tutorId: item.tutorId ?? item.bindTutorId ?? '',
        tutorName: pickFirst([item.tutorName, item.realName, item.bindTutorName]),
        title: pickFirst([item.title, item.demandName, item.parentName, item.name]),
        workDate: pickFirst([item.workDate, item.scheduleDate, item.serviceDate, item.classDate]),
        workTime: pickFirst([
            item.workTime,
            item.serviceTime,
            item.timeRange,
            item.startTime && item.endTime ? `${item.startTime}-${item.endTime}` : ''
        ]),
        location: pickFirst([item.location, item.address, item.serviceAddress]),
        status: item.status ?? item.scheduleStatus ?? item.orderStatus ?? 0,
        statusLabel: pickFirst([item.statusLabel, item.scheduleStatusLabel, item.orderStatusLabel]),
        canStudentComplete: item.canStudentComplete,
        canParentConfirm: item.canParentConfirm,
        auditStatus: item.auditStatus,
        auditStatusLabel: pickFirst([item.auditStatusLabel]),
        amount: item.amount ?? item.totalAmount ?? item.orderAmount ?? item.hourlyBudget ?? 0
    }
}

// 教员库
export function listTutors(query) {
    return request({
        url: '/wxmini/tutoring/tutors/list',
        method: 'get',
        params: query
    })
}

export function getTutors(id) {
    return request({
        url: '/wxmini/tutoring/tutors/' + id,
        method: 'get'
    })
}

export function addTutors(data) {
    return request({
        url: '/wxmini/tutoring/apply',
        method: 'post',
        data: data
    })
}

export function verifyRealNameByWechatPay(data) {
    return request({
        url: '/wxmini/tutoring/real-verify/verify',
        method: 'post',
        data
    })
}

// 获取当前登录教员自己的信息
export function getMyTutor() {
    return request({
        url: '/wxmini/tutoring/mine',
        method: 'get'
    })
}

export function updateMyTutor(data) {
    return request({
        url: '/wxmini/tutoring/mine/update',
        method: 'post',
        data: data
    })
}

// 家教单
export function listParents(query) {
    return request({
        url: '/wxmini/tutoring/parents/list',
        method: 'get',
        params: query
    })
}

export function getParents(id) {
    return request({
        url: '/wxmini/tutoring/parents/' + id,
        method: 'get'
    })
}

export function addParents(data) {
    return request({
        url: '/wxmini/tutoring/parents',
        method: 'post',
        data: data
    })
}

export function getMyParentDemandDetail() {
    return request({
        url: '/wxmini/tutoring/parents/mine/detail',
        method: 'get'
    })
}

export function updateMyParentDemand(id, data) {
    return request({
        url: '/wxmini/tutoring/parents/' + id,
        method: 'put',
        data
    })
}

export function deleteMyParentDemand(id) {
    return request({
        url: '/wxmini/tutoring/parents/' + id,
        method: 'delete'
    })
}

export function getBindableTutors(query = {}) {
    return request({
        url: '/wxmini/tutoring/orders/bindable-tutors',
        method: 'get',
        params: query
    }).then(res => ({
        ...res,
        data: unwrapListResponse(res).map(normalizeTutorCandidate)
    }))
}

export function createTutoringOrder(data, options = {}) {
    return request({
        url: '/wxmini/tutoring/orders',
        method: 'post',
        data,
        ...options
    }).then(res => ({
        ...res,
        data: normalizeTutoringOrder(res?.data || {})
    }))
}

export function getMyTutoringOrders(query = {}) {
    return request({
        url: '/wxmini/tutoring/orders/my',
        method: 'get',
        params: query
    }).then(res => ({
        ...res,
        data: unwrapListResponse(res).map(normalizeTutoringOrder)
    }))
}

export function getMyTutoringSchedules(query = {}) {
    return request({
        url: '/wxmini/tutoring/schedules/my',
        method: 'get',
        params: query
    }).then(res => ({
        ...res,
        data: unwrapListResponse(res).map(normalizeTutoringSchedule)
    }))
}

export function markStudentLessonComplete(orderNo, data = {}) {
    return request({
        url: `/wxmini/tutoring/orders/${orderNo}/student-complete`,
        method: 'post',
        data
    })
}

export function confirmParentLessonComplete(orderNo, data = {}) {
    return request({
        url: `/wxmini/tutoring/orders/${orderNo}/parent-confirm`,
        method: 'post',
        data
    })
}

export function listServiceAddresses() {
    return request({
        url: '/wxmini/address/list',
        method: 'get'
    }).then(res => {
        const list = Array.isArray(res?.data) ? res.data : []
        return {
            ...res,
            data: list.map(item => ({
                id: item.id,
                contactName: item.contactName || '',
                contactPhone: item.contactPhone || '',
                region: item.region || '',
                location: item.location || '',
                geo: item.geo || '',
                addressDetail: item.addressDetail || '',
                doorplate: item.doorplate || '',
                isDefault: Number(item.isDefault || 0),
                remark: item.remark || ''
            }))
        }
    })
}

export function addServiceAddress(data) {
    return request({
        url: '/wxmini/address',
        method: 'post',
        data
    })
}

export function updateServiceAddress(id, data) {
    return request({
        url: '/wxmini/address/' + id,
        method: 'put',
        data
    })
}

export function deleteServiceAddress(id) {
    return request({
        url: '/wxmini/address/' + id,
        method: 'delete'
    })
}

export function setDefaultServiceAddress(id) {
    return request({
        url: '/wxmini/address/' + id + '/default',
        method: 'put'
    })
}

export function uploadTutorCertification(filePath) {
    return upload({
        url: '/wxmini/common/uploadCertification',
        filePath,
        name: 'file',
        showError: false
    })
}

export function uploadTutorAvatar(filePath) {
    return upload({
        url: '/wxmini/common/uploadAvatar',
        filePath,
        name: 'file',
        showError: false
    })
}
